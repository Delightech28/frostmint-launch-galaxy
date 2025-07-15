
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { addNotification } from './notificationUtils';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface TokenData {
  name: string;
  ticker: string;
  initialSupply: string; // store as string for DB compatibility
  tokenType: string;
  description?: string;
  imageUrl?: string;
}

// MemeTokenFactory contract address (Fuji testnet)
export const MEME_TOKEN_FACTORY_ADDRESS = "0xA27550fe25Eda0155B19d52367bA50448C38D30c";

// MemeTokenFactory ABI
export const MEME_TOKEN_FACTORY_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ticker",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "initialSupply",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "taxRate",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "taxReceiver",
				"type": "address"
			}
		],
		"name": "createToken",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newReceiver",
				"type": "address"
			}
		],
		"name": "setFeeReceiver",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newFee",
				"type": "uint256"
			}
		],
		"name": "setMintFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_feeReceiver",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
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
				"name": "owner",
				"type": "address"
			}
		],
		"name": "TokenCreated",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "feeReceiver",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "mintFee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export const deployToken = async (tokenData: TokenData, userWallet: string): Promise<string> => {
  try {
    console.log('Starting token deployment...', tokenData);
    
    // Check if MetaMask is available
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    // Request account access if not already connected
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your MetaMask wallet.');
    }

    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    console.log('Connected account:', await signer.getAddress());

    // Switch to Avalanche network first
    await switchToAvalanche();

    // Prepare MemeTokenFactory contract instance
    const factory = new ethers.Contract(
      MEME_TOKEN_FACTORY_ADDRESS,
      MEME_TOKEN_FACTORY_ABI,
      signer
    );

    // Convert supply to BigInt (18 decimals)
    const initialSupply = BigInt(tokenData.initialSupply);

    // Set your desired tax rate and tax receiver (for now, 0 and userWallet)
    const taxRate = 0n; // You can update this to allow user input
    const taxReceiver = userWallet;

    // Estimate the mint fee (0.01 AVAX)
    const mintFee = ethers.parseEther('0.01');

    // Call createToken on the factory
    const tx = await factory.createToken(
      tokenData.name,
      tokenData.ticker,
      initialSupply,
      taxRate,
      taxReceiver,
      { value: mintFee }
    );

    console.log('Token creation transaction sent:', tx.hash);
    const receipt = await tx.wait();
    // Find the TokenCreated event in the logs
    let contractAddress = '';
    for (const log of receipt.logs) {
      try {
        const parsed = factory.interface.parseLog(log);
        if (parsed && parsed.name === 'TokenCreated') {
          contractAddress = parsed.args[0];
          break;
        }
      } catch {}
    }
    if (!contractAddress) {
      throw new Error('Failed to retrieve new token address from event logs.');
    }
    console.log('Token deployed successfully at:', contractAddress);

    // Save token to database
    const { data: tokenRecord, error: dbError } = await supabase
      .from('tokens')
      .insert({
        name: tokenData.name,
        ticker: tokenData.ticker,
        token_type: tokenData.tokenType,
        initial_supply: tokenData.initialSupply.toString(),
        description: tokenData.description,
        image_url: tokenData.imageUrl,
        creator_wallet: userWallet,
        contract_address: contractAddress,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save token to database: ${dbError.message}`);
    }

    console.log('Token saved to database:', tokenRecord);

    // Add notification for token creation
    await addNotification({
      type: 'token_created',
      title: 'Token Created Successfully!',
      message: `Your ${tokenData.tokenType} "${tokenData.name}" has been deployed to the blockchain.`,
      user_wallet: userWallet,
      token_name: tokenData.name,
      token_ticker: tokenData.ticker,
    });

    return contractAddress;
  } catch (error: any) {
    console.error('Token deployment failed:', error);
    
    // Handle specific MetaMask/Ethereum errors
    if (error.code === 4001) {
      throw new Error('Transaction was rejected by user.');
    } else if (error.code === -32002) {
      throw new Error('MetaMask is already processing a request. Please check MetaMask.');
    } else if (error.code === -32603) {
      throw new Error('Internal JSON-RPC error. Please try again or check your network connection.');
    } else if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient funds to deploy the token. Please ensure you have enough AVAX for gas fees.');
    } else if (error.message?.includes('gas')) {
      throw new Error('Gas estimation failed. Please ensure you have enough AVAX and try again.');
    }
    
    // Re-throw with original message if no specific handling
    throw new Error(error.message || 'Failed to deploy token. Please try again.');
  }
};

export const switchToAvalanche = async (): Promise<boolean> => {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    // Avalanche Fuji Testnet configuration (for testing)
    const avalancheConfig = {
      chainId: '0xA869', // 43113 in hex (Fuji Testnet)
      chainName: 'Avalanche Fuji Testnet',
      rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
      nativeCurrency: {
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18,
      },
      blockExplorerUrls: ['https://testnet.snowtrace.io/'],
    };

    try {
      // Try to switch to Avalanche
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: avalancheConfig.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // If the chain hasn't been added to MetaMask, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [avalancheConfig],
        });
        return true;
      }
      throw switchError;
    }
  } catch (error) {
    console.error('Failed to switch to Avalanche network:', error);
    return false;
  }
};
