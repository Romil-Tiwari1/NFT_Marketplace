// NFTGallery.js
import React from 'react';
import useMyNftCollection from '../useNFTCollection';
import '../style/NFTGallery.css'

const NFTGallery = () => {
  const shouldFetch = true;
  const nfts = useMyNftCollection(shouldFetch);

  if (nfts.length === 0) {
    return <div>No NFTs found in the collection.</div>;
  }

  return (
    <div className="gallery-container">
      <h2 className="gallery-heading">My NFT Collection</h2>
      <div className="gallery">
        {nfts.map((nft) => (
          <div className="card" key={nft.tokenId}>
            <div className="card-image">
              <img src={nft.image} alt={nft.name} />
            </div>
            <div className="card-details">
              <h3>{nft.name}</h3>
              <p>Description: {nft.description}</p>
              <p>Artist: {nft.attributes.find(a => a.trait_type === "Artist").value}</p>
              <p>Creation Date: {nft.attributes.find(a => a.trait_type === "Creation Date").value}</p>
              <p>Medium: {nft.attributes.find(a => a.trait_type === "Medium").value}</p>
              <p>Edition: {nft.attributes.find(a => a.trait_type === "Edition").value}</p>
              {/* ... rest of the details */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTGallery;
