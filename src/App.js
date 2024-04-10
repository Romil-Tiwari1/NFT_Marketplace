import React, { useState } from 'react';
import { ConnectWalletButton } from './components/ConnectWalletButton';
import NFTGallery from './components/NFTGallery';
import NFTForm from './components/NFTForm';
import './App.css';

function App() {
  const [shouldFetchCollection, setShouldFetchCollection] = useState(false);
  const [isDeploymentStarted, setIsDeploymentStarted] = useState(false);
  const handleDeploymentStarted = (started) => {
    setShouldFetchCollection(started);
  };

  return (
    <div className="App">
      <ConnectWalletButton />
      <main className="content">
        <section className="nft-form-section">
          <NFTForm onDeploymentStarted={setIsDeploymentStarted} />
        </section>
        {isDeploymentStarted && (
          <section className="nft-collection-section">
            <NFTGallery />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
