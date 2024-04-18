// src/utils/contracts.js
import { ethers } from 'ethers';
import MyNFTAbi from '../abis/MyNFT.json'; // the ABI for your contract

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS; // Replace with your deployed contract address

// Function to create a contract instance

export const getContract = (signerOrProvider) => {
    return new ethers.Contract(contractAddress, MyNFTAbi.abi, signerOrProvider);
};



