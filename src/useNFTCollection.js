import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import MyNFTJson from './abis/MyNFT.json';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const useMyNftCollection = (shouldFetch) => {
    const [nfts, setNfts] = useState([]);
    // Your Infura RPC URL
    const rpcURL = 'https://sepolia.infura.io/v3/cc0c53eb9b624ac595bc708575bbeed5';
    const pollInterval = 15000;
    const BACKEND_API_URL = process.env.REACT_APP_NGROK_URL;
    console.log('NFT COLLECTION : NGROK URL',BACKEND_API_URL);

    const fetchDeployedContractAddress = async () => {
        try {
            const response = await axios.get(`${BACKEND_API_URL}/getDeployedAddress`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'Accept': 'application/json'
                }
            });
            console.log(`Response Content-Type: ${response.headers['content-type']}`);
            console.log(`Deployed contract address: ${response.data.address}`);
            return response.data.address;
        } catch (error) {
            console.error('Error fetching deployed contract address:', error);
            return null;
        }
    };

    const fetchNFTs = async (contractAddress) => {
        console.log(`Fetching NFTs for contract at address: ${contractAddress}`);
        const provider = new ethers.providers.JsonRpcProvider(rpcURL);
        const contract = new ethers.Contract(contractAddress, MyNFTJson.abi, provider);
        const allNfts = [];

        try {
            const totalSupply = await contract.totalSupply();
            console.log(`Total supply for contract ${contractAddress}: ${totalSupply}`);

            for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
                try {
                    const tokenURI = await contract.tokenURI(tokenId);
                    console.log(`Token URI for token ID ${tokenId}: ${tokenURI}`); 

                    // Check if the tokenURI starts with 'ipfs://'
                    let correctedTokenURI = tokenURI;
                    const ipfsPattern = 'ipfs://';
                    const splitURI = tokenURI.split(ipfsPattern);
                    if (splitURI.length > 2) {
                        correctedTokenURI = ipfsPattern + splitURI[splitURI.length - 1];
                    }
                    console.log(`Corrected Token URI for token ID ${tokenId}: ${correctedTokenURI}`);

                    const metadataUrl = `${BACKEND_API_URL}/ipfs/${correctedTokenURI.split(ipfsPattern)[1]}`;
                    console.log(`Metadata URL for token ID ${tokenId}: ${metadataUrl}`);

                    const response = await axios.get(metadataUrl, {
                        headers: {
                            'ngrok-skip-browser-warning': 'true',
                            'Accept': 'application/json'
                        }
                    });


                    console.log(`Response from fetch for token ID ${tokenId}:`, response);
                    const metadata = response.data;
                    console.log(`Metadata for token ID ${tokenId}:`, metadata);
                    const imageUrl = metadata.image.startsWith('ipfs://')
                        ? `https://ipfs.io/ipfs/${metadata.image.split('ipfs://')[1]}`
                        : metadata.image;
                    console.log(`Image URL for token ID ${tokenId}: ${imageUrl}`);

                    allNfts.push({
                        contract: contractAddress,
                        tokenId,
                        image: imageUrl,
                        name: metadata.name,
                        description: metadata.description,
                        attributes: metadata.attributes,
                    });
                } catch (error) {
                    console.error(`Failed to fetch metadata for token ID ${tokenId}:`, error);
                }
            }
        } catch (error) {
            console.error(`Failed to fetch total supply for contract:`, error);
        }

        setNfts(allNfts);
    };

    const pollDeployedAddress = async () => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const deployedAddress = await fetchDeployedContractAddress();
                    if (deployedAddress) {
                        clearInterval(interval);
                        resolve(deployedAddress);
                    }
                } catch (error) {
                    clearInterval(interval);
                    reject(error);
                }
            }, pollInterval);
        });
    };

    useEffect(() => {
        const init = async () => {
            if (shouldFetch) {
                const deployedAddress = await pollDeployedAddress();
                if (deployedAddress) {
                    await delay(10000);
                    await fetchNFTs(deployedAddress);
                } else {
                    console.log('Unable to find deployed contract address after polling.');
                }
            }
        };

        init();
    }, [shouldFetch]);

    return nfts;
};

export default useMyNftCollection;
