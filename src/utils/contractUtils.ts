
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';

export const MEME_COIN_FACTORY_ADDRESS = '0x7C05dA83a4Fe020aCB26DD8CdAEE9fe9f94760A2';

export const MEME_COIN_FACTORY_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "initialSupply",
        "type": "uint256"
      }
    ],
    "name": "createToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      }
    ],
    "name": "TokenCreated",
    "type": "event"
  }
];

export const checkTokenExists = async (name: string, ticker: string) => {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('name, ticker')
      .or(`name.eq.${name},ticker.eq.${ticker}`);

    if (error) {
      console.error('Error checking token existence:', error);
      return { exists: false, field: null };
    }

    if (data && data.length > 0) {
      const existingToken = data[0];
      if (existingToken.name === name) {
        return { exists: true, field: 'name' };
      }
      if (existingToken.ticker === ticker) {
        return { exists: true, field: 'ticker' };
      }
    }

    return { exists: false, field: null };
  } catch (error) {
    console.error('Error checking token existence:', error);
    return { exists: false, field: null };
  }
};

export const saveTokenToDatabase = async (
  name: string,
  ticker: string,
  contractAddress: string,
  creatorWallet: string,
  initialSupply: string,
  description?: string
) => {
  try {
    const { data, error } = await supabase
      .from('tokens')
      .insert({
        name,
        ticker,
        contract_address: contractAddress,
        creator_wallet: creatorWallet,
        initial_supply: parseInt(initialSupply),
        description: description || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving token to database:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving token to database:', error);
    throw error;
  }
};

export const createMemeCoin = async (
  name: string,
  ticker: string,
  initialSupply: string,
  creatorWallet: string,
  description?: string
) => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  // Check if token name or ticker already exists
  const { exists, field } = await checkTokenExists(name, ticker);
  if (exists) {
    throw new Error(`Token ${field} "${field === 'name' ? name : ticker}" already exists. Please choose a different ${field}.`);
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const contract = new ethers.Contract(
    MEME_COIN_FACTORY_ADDRESS,
    MEME_COIN_FACTORY_ABI,
    signer
  );

  // Convert initial supply to wei (assuming 18 decimals)
  const supplyInWei = ethers.parseUnits(initialSupply, 18);
  
  // Send 0.01 AVAX as minting fee
  const mintingFee = ethers.parseEther("0.01");
  
  const tx = await contract.createToken(name, ticker, supplyInWei, {
    value: mintingFee
  });
  
  return tx;
};

export const getTokenAddressFromReceipt = async (
  receipt: ethers.TransactionReceipt, 
  name: string, 
  ticker: string, 
  creatorWallet: string, 
  initialSupply: string, 
  description?: string
): Promise<string | null> => {
  console.log('Receipt logs:', receipt.logs);
  
  // Create interface for parsing events
  const iface = new ethers.Interface(MEME_COIN_FACTORY_ABI);
  
  for (const log of receipt.logs) {
    try {
      console.log('Processing log:', log);
      
      // Parse the log
      const parsed = iface.parseLog({
        topics: log.topics,
        data: log.data
      });
      
      console.log('Parsed log:', parsed);
      
      if (parsed && parsed.name === 'TokenCreated') {
        const tokenAddress = parsed.args.tokenAddress;
        console.log('Found TokenCreated event, token address:', tokenAddress);
        
        // Save token to database
        try {
          await saveTokenToDatabase(
            name,
            ticker,
            tokenAddress,
            creatorWallet,
            initialSupply,
            description
          );
          console.log('Token saved to database successfully');
        } catch (dbError) {
          console.error('Failed to save token to database:', dbError);
          // Don't throw here, we still want to return the address
        }
        
        return tokenAddress;
      }
    } catch (error) {
      console.log('Error parsing log:', error);
      // Continue to next log if parsing fails
      continue;
    }
  }
  
  // Alternative approach: look for logs from the factory contract
  const factoryLogs = receipt.logs.filter(log => 
    log.address.toLowerCase() === MEME_COIN_FACTORY_ADDRESS.toLowerCase()
  );
  
  console.log('Factory logs:', factoryLogs);
  
  for (const log of factoryLogs) {
    try {
      const parsed = iface.parseLog({
        topics: log.topics,
        data: log.data
      });
      
      if (parsed && parsed.name === 'TokenCreated') {
        const tokenAddress = parsed.args.tokenAddress;
        console.log('Found TokenCreated event in factory logs, token address:', tokenAddress);
        
        // Save token to database
        try {
          await saveTokenToDatabase(
            name,
            ticker,
            tokenAddress,
            creatorWallet,
            initialSupply,
            description
          );
          console.log('Token saved to database successfully');
        } catch (dbError) {
          console.error('Failed to save token to database:', dbError);
        }
        
        return tokenAddress;
      }
    } catch (error) {
      console.log('Error parsing factory log:', error);
      continue;
    }
  }
  
  console.log('No TokenCreated event found in receipt');
  return null;
};
