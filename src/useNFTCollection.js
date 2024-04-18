import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useProvider } from 'wagmi';
import MyNFTJson from './abis/MyNFT.json';
import COLLECTION_ABI from './abis/CollectionNFT.json';

const useMyNftCollection = (collectionAddresses, refreshTrigger) => {
    const [nfts, setNfts] = useState([]);
    const provider = useProvider();
    //const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;;

    useEffect(() => {
        async function fetchNFTsFromCollection(address) {
            console.log(`Fetching NFTs from collection at address: ${address}`);
            const contract = new ethers.Contract(address, COLLECTION_ABI.abi, provider);
            try {
                const totalSupply = await contract.totalSupply();
                console.log(`Total supply for ${address}: ${totalSupply.toNumber()}`);
                const nftPromises = [];

                for (let i = 1; i <= totalSupply.toNumber(); i++) {
                    nftPromises.push(fetchNFTData(contract, i));
                }

                const nfts = await Promise.all(nftPromises);
                console.log(`Fetched NFTs from ${address}:`, nfts);
                return nfts.filter(nft => nft);  // Filter out undefined entries
            } catch (error) {
                console.error(`Error fetching NFTs from ${address}:`, error);
                throw error;
            }
        }

        async function fetchAllNfts() {
            if (collectionAddresses.length > 0) {
                console.log('Fetching NFTs from all addresses...');
                const allNfts = await Promise.all(collectionAddresses.map(addr => fetchNFTsFromCollection(addr)));
                setNfts(allNfts.flat());
                console.log('All fetched NFTs:', allNfts.flat());
            }
        }

        if (provider && collectionAddresses.length > 0) {
            fetchAllNfts();
        }

    }, [provider, JSON.stringify(collectionAddresses), refreshTrigger]);  // Ensure this effect is only invoked when provider or contractAddress changes

    return { nfts };
};

async function fetchWithRetry(url, attempts, delay) {
    for (let i = 0; i < attempts; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.log(`Attempt ${i + 1} failed: ${e.message}`);
            if (i < attempts - 1) {
                await new Promise(r => setTimeout(r, delay));
                delay *= 2; // Exponential back-off
            } else {
                throw e; // Rethrow the error after the last attempt
            }
        }
    }
}

async function fetchNFTData(contract, tokenId) {
    const tokenURI = await contract.tokenURI(tokenId);
    const correctedTokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
    
    try {
        // Use fetchWithRetry instead of the fetch directly.
        const metadata = await fetchWithRetry(correctedTokenURI, 3, 5000); // 3 attempts with an initial delay of 1000ms
        console.log(`Fetched metadata for token ${tokenId}:`, metadata);
        
        // Retrieve the symbol for the token
        const symbol = await contract.tokenSymbol(tokenId);
        console.log(`Adding symbol "${symbol}" to NFT with id=${tokenId}`);
        
        // Return the NFT data
        return {
            tokenId: tokenId.toString(),
            name: metadata.name,
            description: metadata.description,
            image: metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
            attributes: metadata.attributes,
            symbol: symbol,
        };
    } catch (error) {
        console.error(`Failed to fetch metadata for token ${tokenId}:`, error);
        throw error; // Propagate the error to be handled by the caller
    }
}

export default useMyNftCollection;