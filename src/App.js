import React, { useState, useCallback } from 'react';
import { WagmiConfig, createClient, chain, configureChains } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { ConnectWalletButton } from './components/ConnectWalletButton';
import NFTGallery from './components/NFTGallery';
import NFTForm from './components/NFTForm';
import './App.css'

// Define custom RPC URL for Sepolia
const sepoliaRpcUrl = `https://sepolia.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`;

// Define the Sepolia chain information
const sepoliaChain = {
  ...chain.mainnet, // Copy over the mainnet configuration
  id: 11155111, // Use the correct chain ID for Sepolia
  name: 'Sepolia',
  network: 'sepolia',
  rpcUrls: {
    default: sepoliaRpcUrl,
  },
};

// Configure the chains and providers
const { provider, webSocketProvider } = configureChains(
  [sepoliaChain],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === sepoliaChain.id) {
          return { http: sepoliaRpcUrl };
        }
        return null;
      },
    }),
  ],
);

// Initialize the wagmi client with the provider
const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

function App() {
  const [isDeploymentStarted, setIsDeploymentStarted] = useState(false);
  const [collectionAddresses, setCollectionAddresses] = useState([]);

  const handleNFTMinted = () => {
    setIsDeploymentStarted(prevState => !prevState); // Toggle state to refresh the gallery
  };

  const handleNewCollection = useCallback((newAddress) => {
    setCollectionAddresses(prev => [...prev, newAddress]);
    console.log(`New collection address added: ${newAddress}`);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <ConnectWalletButton />
        <main className="content">
        <section className="nft-form-section">
        <NFTForm onDeploymentStarted={setIsDeploymentStarted} onNFTMinted={handleNFTMinted} onNewCollectionCreated={handleNewCollection} />
        </section>
        {isDeploymentStarted && (
          <section className="nft-collection-section">
            <NFTGallery collectionAddresses={collectionAddresses} />
          </section>
        )}
        </main>
      </header>
    </div>
  );
}

const WrappedApp = () => (
  <WagmiConfig client={client}>
    <App />
  </WagmiConfig>
);

export default WrappedApp;
