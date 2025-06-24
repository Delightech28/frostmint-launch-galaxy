
import { ethers } from 'ethers';

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

export const createMemeCoin = async (
  name: string,
  ticker: string,
  initialSupply: string
) => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
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

export const getTokenAddressFromReceipt = (receipt: ethers.TransactionReceipt): string | null => {
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
        console.log('Found TokenCreated event, token address:', parsed.args.tokenAddress);
        return parsed.args.tokenAddress;
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
        console.log('Found TokenCreated event in factory logs, token address:', parsed.args.tokenAddress);
        return parsed.args.tokenAddress;
      }
    } catch (error) {
      console.log('Error parsing factory log:', error);
      continue;
    }
  }
  
  console.log('No TokenCreated event found in receipt');
  return null;
};
