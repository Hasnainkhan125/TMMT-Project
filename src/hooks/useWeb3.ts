
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
// import { injected } from 'wagmi/connectors';

export const useWeb3 = () => {
  const { address, isConnected } = useAccount();
  // @ts-ignore
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [provider, setProvider] = useState<ethers.Provider | null>(null);
        
  useEffect(() => {
    if(typeof window !== 'undefined' && (window as any).ethereum) {
      const provider = new ethers.JsonRpcProvider((window as any).ethereum as any);
      setProvider(provider);
    }
  }, []);

  return {
    address,
    isConnected,
    provider,
    connect,
    disconnect,
  };
};