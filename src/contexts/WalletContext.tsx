
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import MetaMaskDialog from '@/components/MetaMaskDialog';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showMetaMaskDialog, setShowMetaMaskDialog] = useState(false);

  // Check if already connected on mount
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        await switchToAvalanche();
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAddress(null);
    } else {
      setAddress(accounts[0]);
      setIsConnected(true);
    }
  };

  const switchToAvalanche = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA869' }], // Avalanche Fuji Testnet
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xA869',
              chainName: 'Avalanche Fuji Testnet',
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
              },
              rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
              blockExplorerUrls: ['https://testnet.snowtrace.io/'],
            }],
          });
        } catch (addError) {
          console.error('Failed to add Avalanche network:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      setShowMetaMaskDialog(true);
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        
        // Switch to Avalanche network
        await switchToAvalanche();
        
        toast.success('Wallet connected successfully!');
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    toast.success('Wallet disconnected');
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
      <MetaMaskDialog 
        isOpen={showMetaMaskDialog} 
        onClose={() => setShowMetaMaskDialog(false)} 
      />
    </WalletContext.Provider>
  );
};
