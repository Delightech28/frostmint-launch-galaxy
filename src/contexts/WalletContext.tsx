
import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

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

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsConnected(true);
    }
  }, []);

  const connect = async () => {
    try {
      // Mock wallet connection for now
      const mockAddress = '0x742d35Cc631C0532925a3b8D03a1aB5C4d7E3bfc';
      setAddress(mockAddress);
      setIsConnected(true);
      localStorage.setItem('walletAddress', mockAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('walletAddress');
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};
