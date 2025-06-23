import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MetaMaskDialog from '@/components/MetaMaskDialog';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isCorrectNetwork: boolean;
  switchToAvalanche: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const AVALANCHE_FUJI = {
  chainId: '0xA869', // 43113 in hex
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [showMetaMaskDialog, setShowMetaMaskDialog] = useState(false);

  const checkNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setIsCorrectNetwork(chainId === AVALANCHE_FUJI.chainId);
      } catch (error) {
        console.error('Error checking network:', error);
        setIsCorrectNetwork(false);
      }
    }
  };

  const switchToAvalanche = async () => {
    if (!window.ethereum) {
      setShowMetaMaskDialog(true);
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AVALANCHE_FUJI.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AVALANCHE_FUJI],
          });
        } catch (addError) {
          console.error('Error adding Avalanche network:', addError);
          alert('Failed to add Avalanche Fuji network to MetaMask');
        }
      } else {
        console.error('Error switching to Avalanche network:', switchError);
        alert('Failed to switch to Avalanche Fuji network');
      }
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            await checkNetwork();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setAddress(null);
          setIsConnected(false);
        }
      });

      window.ethereum.on('chainChanged', () => {
        checkNetwork();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      setShowMetaMaskDialog(true);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        localStorage.setItem('walletAddress', accounts[0]);
        
        await checkNetwork();
        
        if (!isCorrectNetwork) {
          const shouldSwitch = confirm(
            'You are not connected to Avalanche Fuji testnet. Would you like to switch networks?'
          );
          if (shouldSwitch) {
            await switchToAvalanche();
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      if (error.code === 4001) {
        alert('Please connect to MetaMask to continue.');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setIsCorrectNetwork(false);
    localStorage.removeItem('walletAddress');
  };

  return (
    <WalletContext.Provider value={{ 
      isConnected, 
      address, 
      connect, 
      disconnect, 
      isCorrectNetwork, 
      switchToAvalanche 
    }}>
      {children}
      <MetaMaskDialog 
        isOpen={showMetaMaskDialog} 
        onClose={() => setShowMetaMaskDialog(false)} 
      />
    </WalletContext.Provider>
  );
};

declare global {
  interface Window {
    ethereum?: any;
  }
}
