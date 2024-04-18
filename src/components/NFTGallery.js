// NFTGallery.js
import React, { useEffect, useState } from 'react';
import useMyNftCollection from '../useNFTCollection';
import '../style/NFTGallery.css'

const NFTGallery = ({ collectionAddresses, refreshTrigger }) => {
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(false);
  useEffect(() => {
    if (refreshTrigger) {
      console.log('Refresh trigger activated.');
      setLocalRefreshTrigger(prev => !prev); // Toggle local refresh trigger to refetch NFTs
    }
  }, [refreshTrigger]);

  const { nfts, loading, error } = useMyNftCollection(collectionAddresses, refreshTrigger);

  console.log('Collection Addresses:', collectionAddresses);
  console.log('NFTs to be displayed:', nfts);

  if (error) {
    console.error('Error fetching NFTs:', error);
    return <div>Error fetching NFTs: {error.message}</div>;
  }

  if (loading) {
    console.log('Loading NFTs...');
    return <div>Loading NFTs...</div>;
  }

  if (nfts.length === 0) {
    console.log('No NFTs found in the collection');
    return <div>No NFTs found in the collection.</div>;
  }

  const groupedNFTs = nfts.reduce((acc, nft) => {
    const symbol = nft.symbol; // Assume symbol is part of the NFT data fetched
    if (!acc[symbol]) {
      acc[symbol] = [];
    }
    acc[symbol].push(nft);
    return acc;
  }, {});

  return (
    <div className="gallery-container">
      {Object.entries(groupedNFTs).map(([symbol, nfts]) => (
        <div key={symbol}>
          <h3>{symbol}</h3>
          <div className="gallery">
            {nfts.map((nft) => (
              <div className="card" key={`${nft.collectionAddress}-${nft.tokenId}`}>
                <div className="card-image">
                  <img src={nft.image} alt={nft.name} />
                </div>
                <div className="card-details">
                  <h3 className="card-details-title">{nft.name}</h3>
                  <p>Description: {nft.description}</p>
                  <p>Artist: {nft.attributes.find(a => a.trait_type === "Artist")?.value}</p>
                  <p>Creation Date: {nft.attributes.find(a => a.trait_type === "Creation Date")?.value}</p>
                  <p>Payment Type: {nft.attributes.find(a => a.trait_type === "Payment Type")?.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NFTGallery;
