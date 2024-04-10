import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import '../style/Header.css';

export const ConnectWalletButton = () => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);

  // When the component mounts, check if the wallet is already connected
  useEffect(() => {
    setHasConnectedOnce(isConnected);
  }, [isConnected]);

  const handleConnection = async () => {
    if (isConnected) {
      // Disconnect the wallet
      await disconnect();
    } else {
      // Connect the wallet
      await connect({ connector: connectors[0] });
      setHasConnectedOnce(true); // Set the flag to true when wallet is connected
    }
  };

  // Apply the 'connected' class based on the hasConnectedOnce flag
  return (
    <div className="header">
      <h1 className="title">Welcome to NFT MarketPlace DApp</h1>
      <button 
        onClick={handleConnection} 
        className={`wallet-button ${hasConnectedOnce ? 'connected' : ''}`}
      >
        {isConnected ? 'Wallet Connected' : 'Connect MetaMask'}
      </button>
    </div>
  );
};
