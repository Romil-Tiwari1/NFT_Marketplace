// src/components/NFTForm.js

import React, { useState } from 'react';
import { uploadFileToIPFS, saveMetadataToIPFS, deployContractWithMetadata } from '../utils/ipfs';
import '../style/NFTForm.css';

const NFTForm = ({ onDeploymentStarted }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);

    const handleNameChange = (event) => setName(event.target.value);
    const handleDescriptionChange = (event) => setDescription(event.target.value);
    const handleFileChange = (event) => setFile(event.target.files[0]);

    // Add a new state to track the deployment status
    const [isDeploying, setIsDeploying] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (file && name && description) {
            try {
                const imageCID = await uploadFileToIPFS(file);
                const metadata = {
                    name: name,
                    description: description,
                    image: `ipfs://${imageCID}`,
                    attributes: [
                        {
                            "trait_type": "Artist",
                            "value": "Jujutsu Kaisen"
                        },
                        {
                            "trait_type": "Creation Date",
                            "value": "2024-02-07"
                        },
                        {
                            "trait_type": "Medium",
                            "value": "Digital"
                        },
                        {
                            "trait_type": "Edition",
                            "value": "1 of 100"
                        }
                    ],
                };
                setIsDeploying(true);
                const metadataCID = await saveMetadataToIPFS(metadata, '1.json');
                console.log(`Metadata uploaded to IPFS with CID: ${metadataCID}`);
                await deployContractWithMetadata(metadataCID);
                onDeploymentStarted(true);
                // await mintNFT(metadataCID);
            } catch (error) {
                setIsDeploying(false);
                console.error('Error minting NFT:', error);
                alert('Error minting NFT. See console for details.');
            }
        } else {
            alert('Please provide all required fields.');
        }
    };

    return (
        <div className="nft-form-container">
            <form onSubmit={handleSubmit} className="nft-form">
                <h2 className="nft-form-heading">Build Your Own NFT</h2>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" placeholder="Name" value={name} onChange={handleNameChange} required />
                <label htmlFor="description">Description</label>
                <textarea id="description" placeholder="Description" value={description} onChange={handleDescriptionChange} required />
                <label htmlFor="file">Upload Image</label>
                <input type="file" id="file" onChange={handleFileChange} required />
                <button type="submit" className="nft-form-button">Create NFT</button>
            </form>
        </div>
    );
};

export default NFTForm;
