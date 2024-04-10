// Ipfs.js
import axios from 'axios';

// Define the API URL for your local IPFS node
const LOCAL_IPFS_API_URL = 'http://127.0.0.1:5001/api/v0';
const NGROK_URL = process.env.REACT_APP_NGROK_URL;

// Create an axios instance configured to connect to your local IPFS node
const axiosInstance = axios.create({
  baseURL: LOCAL_IPFS_API_URL
});

// Function to upload a file to a local IPFS node
export const uploadFileToIPFS = async (file) => {
  console.log('Uploading file to local IPFS node...');

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.post('/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('File uploaded successfully to local IPFS node:', response.data);
    return response.data.Hash;
  } catch (error) {
    console.error('Error uploading file to local IPFS node:', error);
    throw error;
  }
};

// Function to save metadata as a JSON file to a local IPFS node
export const saveMetadataToIPFS = async (metadata) => {
  console.log('Saving metadata to local IPFS node...');

  // Convert the JavaScript object to a JSON blob
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const formData = new FormData();
  formData.append('file', blob, '1.json');

  try {
    const response = await axiosInstance.post('/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log('Metadata saved successfully to local IPFS node:', response.data);
    return response.data.Hash;
  } catch (error) {
    console.error('Error saving metadata to local IPFS node:', error);
    throw error;
  }
};

// Function to call the backend service to deploy the contract
export const deployContractWithMetadata = async (metadataHash) => {
  const metadataURI = `ipfs://${metadataHash}`;
  console.log(`Requesting backend to deploy contract with metadata URI: ${metadataURI}`);

  try {
    console.log('IPFS : NGROK URL :', NGROK_URL);
    const response = await axios.post(`${NGROK_URL}/deploy`, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      metadataURI: metadataURI,
    });
    console.log('Backend has started the deployment process:', response.data);
  } catch (error) {
    console.error('Error requesting contract deployment from backend:', error);
    throw error;
  }
};
