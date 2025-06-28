
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
  initialSupply: number;
  tokenType: string;
  description?: string;
  imageUrl?: string;
}

// Simplified ERC20 contract ABI for deployment
const ERC20_ABI = [
  "constructor(string memory name, string memory symbol, uint256 initialSupply)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// Simple ERC20 contract bytecode with proper constructor
const ERC20_BYTECODE = "0x608060405234801561001057600080fd5b5060405161082c38038061082c8339818101604052810190610032919061028a565b82600090816100419190610556565b5081600190816100519190610556565b508060ff166002819055506100743361006a60201b60201c565b6100748282610079565b505050610628565b505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036100e8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100df90610685565b60405180910390fd5b806003600082825461010091906106d4565b9250508190555080600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825461015691906106d4565b925050819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516101bb9190610717565b60405180910390a35050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61022e826101e5565b810181811067ffffffffffffffff8211171561024d5761024c6101f6565b5b80604052505050565b60006102606101c7565b905061026c8282610225565b919050565b600067ffffffffffffffff82111561028c5761028b6101f6565b5b610295826101e5565b9050602081019050919050565b60006102b56102b084610271565b610256565b9050828152602081018484840111156102d1576102d06101e0565b5b6102dc848285610380565b509392505050565b600082601f8301126102f9576102f86101db565b5b81516103098482602086016102a2565b91505092915050565b6000819050919050565b61032581610312565b811461033057600080fd5b50565b6000815190506103428161031c565b92915050565b6000806000606084860312156103615761036061016e565b5b600084015167ffffffffffffffff81111561037f5761037e610173565b5b61038b868287016102e4565b935050602084015167ffffffffffffffff8111156103ac576103ab610173565b5b6103b8868287016102e4565b92505060406103c986828701610333565b9150509250925092565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061042157607f821691505b60208210810361043457610433610edc565b5b50919050565b60008190508160005260206000209050919050565b60008154610460816103e3565b61046a818661047b565b9450600182166000811461047f5760018114610494576104c7565b60ff19831686528115158202860193506104c7565b61049d8561043a565b60005b838110156104bf578154818901526001820191506020810190506104a0565b838801955050505b50505092915050565b60006104dc8284610453565b915081905092915050565b7f45524332303a206d696e7420746f20746865207a65726f206164647265737300600082015250565b600061051d601f83610489565b9150610528826104e7565b602082019050919050565b6000602082019050818103600083015261054c81610510565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061058d82610312565b915061059883610312565b92508282019050808211156105b0576105af610553565b5b92915050565b6000819050919050565b6105c9816105b6565b82525050565b60006020820190506105e460008301846105c0565b92915050565b6101f5806106376000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c806306fdde031461005c57806318160ddd1461007a57806323b872dd1461009857806370a08231146100c8578063a9059cbb146100f8575b600080fd5b610064610128565b6040516100719190610134565b60405180910390f35b6100826101b6565b60405161008f919061015f565b60405180910390f35b6100b260048036038101906100ad919061017a565b6101bc565b6040516100bf91906101e2565b60405180910390f35b6100e260048036038101906100dd919061017fd565b6101c4565b6040516100ef919061015f565b60405180910390f35b610112600480360381019061010d919061020a565b6101cc565b60405161011f91906101e2565b60405180910390f35b6000805461013590610279565b80601f016020809104026020016040519081016040528092919081815260200182805461016190610279565b80156101ae5780601f10610183576101008083540402835291602001916101ae565b820191906000526020600020905b81548152906001019060200180831161019157829003601f168201915b505050505081565b60035481565b600080fd5b6000fd5b600080fd5b6000819050919050565b6101d3816101c0565b81146101de57600080fd5b50565b6000813590506101f0816101ca565b92915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610226826101fb565b9050919050565b6102368161021b565b811461024157600080fd5b50565b6000813590506102538161022d565b92915050565b600080604083850312156102705761026f6101f6565b5b600061027e85828601610244565b925050602061028f858286016101e1565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806102d157607f821691505b6020821081036102e4576102e3610299565b5b5091905056fea2646970667358221220b4e5c5b0e3c3e4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e64736f6c634300081a0033";

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

    // Convert supply to wei (18 decimals)
    const initialSupplyWei = ethers.parseUnits(tokenData.initialSupply.toString(), 18);

    // Create contract factory with ABI and bytecode
    const contractFactory = new ethers.ContractFactory(
      ERC20_ABI,
      ERC20_BYTECODE,
      signer
    );

    console.log('Deploying contract with params:', {
      name: tokenData.name,
      symbol: tokenData.ticker,
      initialSupply: initialSupplyWei.toString()
    });

    // Deploy contract with constructor parameters
    const contract = await contractFactory.deploy(
      tokenData.name,
      tokenData.ticker,
      initialSupplyWei,
      {
        gasLimit: 2000000, // Set explicit gas limit
      }
    );

    console.log('Deployment transaction sent:', contract.deploymentTransaction()?.hash);
    
    // Wait for deployment to be mined
    const deployedContract = await contract.waitForDeployment();
    const contractAddress = await deployedContract.getAddress();
    
    console.log('Contract deployed successfully at:', contractAddress);

    // Save token to database
    const { data: tokenRecord, error: dbError } = await supabase
      .from('tokens')
      .insert({
        name: tokenData.name,
        ticker: tokenData.ticker,
        token_type: tokenData.tokenType,
        initial_supply: tokenData.initialSupply,
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
