
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
  for (const log of receipt.logs) {
    try {
      const iface = new ethers.Interface(MEME_COIN_FACTORY_ABI);
      const parsed = iface.parseLog({
        topics: log.topics,
        data: log.data
      });
      
      if (parsed && parsed.name === 'TokenCreated') {
        return parsed.args.tokenAddress;
      }
    } catch (error) {
      // Continue to next log if parsing fails
      continue;
    }
  }
  return null;
};
