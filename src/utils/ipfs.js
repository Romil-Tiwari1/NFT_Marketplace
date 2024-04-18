// Ipfs.js
import axios from 'axios';

const PINATA_BASE_URL = 'https://api.pinata.cloud';
const PINATA_API_KEY = '137d61517291c42e1e86'; // Replace with your Pinata API Key
const PINATA_API_SECRET = '5086f6db6cf7ad13216099114c459a84c9c77f2ee1f96116c2d3ba34941bced1'; // Replace with your Pinata Secret API Key

export const uploadFileToIPFS = async (file) => {
    const url = `${PINATA_BASE_URL}/pinning/pinFileToIPFS`;

    // We need to prepare formData since we are sending a file
    let data = new FormData();
    data.append('file', file);

    // Axios config for POST request
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_API_SECRET,
        },
    };

    try {
        const response = await axios.post(url, data, config);
        // Pinata response contains an IpfsHash
        console.log('Image uploaded to IPFS:', response.data.IpfsHash);
        return response.data.IpfsHash;
    } catch (error) {
        console.error('Error uploading file to IPFS via Pinata:', error);
        throw error;
    }
};

export const saveMetadataToIPFS = async (metadata) => {
    const url = `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`;

    // Axios config for POST request
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': PINATA_API_KEY,
            'pinata_secret_api_key': PINATA_API_SECRET,
        },
    };

    try {
        const response = await axios.post(url, metadata, config);
        // Pinata response contains an IpfsHash
        console.log('Metadata uploaded to IPFS:', response.data.IpfsHash);
        return response.data.IpfsHash;
    } catch (error) {
        console.error('Error saving metadata to IPFS via Pinata:', error);
        throw error;
    }
};
