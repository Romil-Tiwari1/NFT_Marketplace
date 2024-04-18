// src/components/NFTForm.js
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { uploadFileToIPFS, saveMetadataToIPFS } from '../utils/ipfs';
import '../style/NFTForm.css';
import { getContract } from '../utils/contracts';
import { useSigner } from 'wagmi';
import ERC20_ABI from '../abis/IERC20.json';
import FACTORY_ABI from '../abis/NFTFactory.json'; // Make sure you have the ABI for your Factory
import COLLECTION_ABI from '../abis/CollectionNFT.json'; // ABI for your collection contracts



const NFTForm = ({ onDeploymentStarted, onNFTMinted, onNewCollectionCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [symbol, setSymbol] = useState('');
    const [file, setFile] = useState(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [erc20Address, setERC20Address] = useState('');
    const [price, setPrice] = useState('');
    const [isERC20Payment, setIsERC20Payment] = useState(false); // State to track payment type
    const [paymentType, setPaymentType] = useState('ETH');
    const { data: signer } = useSigner();
    const contract = getContract(signer);
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

    const factoryAddress = process.env.REACT_APP_FACTORY_ADDRESS; // Ensure this is set in your environment
    const factoryContract = new ethers.Contract(factoryAddress, FACTORY_ABI.abi, signer);

    const [collectionAddresses, setCollectionAddresses] = useState([]);

    // Function to create a new collection through the factory contract
    const createCollection = async () => {
        if (!signer) {
            alert('Wallet not connected');
            return;
        }
        console.log("Creating Collection...", factoryContract);
        try {
            const paymentToken = isERC20Payment ? erc20Address : '0x0000000000000000000000000000000000000000'; // Zero address for ETH
            const tokenPrice = isERC20Payment ? ethers.utils.parseUnits(price, 'ether') : 0; // 0 for ETH

            const createTx = await factoryContract.createCollection(
                name,
                symbol, // Replace "SYMBOL" with actual symbol if necessary
                paymentToken,
                tokenPrice
            );
            const receipt = await createTx.wait();
            console.log('Events:', receipt.events);
            console.log('Collection created:', receipt);

            const collectionCreatedEvent = receipt.events?.find(e => e.event === 'CollectionCreated');
            if (!collectionCreatedEvent) {
                throw new Error("CollectionCreated event not found.");
            }

            const newCollectionAddress = collectionCreatedEvent.args.collectionAddress;
            console.log('New collection address:', newCollectionAddress);

            alert('New collection created successfully!');
            onNewCollectionCreated(newCollectionAddress);
            return newCollectionAddress;
        } catch (error) {
            console.error('Failed to create collection:', error);
            alert('Failed to create collection. See console for details.');
        }
    };

    const setPaymentTokenAndPrice = async () => {
        try {
            const tokenPrice = ethers.utils.parseUnits(price, 'ether');
            console.log(`Setting payment token and price. Token Address: ${erc20Address}, Price: ${price}`);

            const setTokenTx = await contract.setPaymentTokenAndPrice(erc20Address, tokenPrice);
            console.log('Transaction for setting payment token and price submitted:', setTokenTx);

            const receipt = await setTokenTx.wait();
            console.log('Transaction receipt for setting payment token and price:', receipt);

            if (receipt.status === 1) {
                alert('Payment token and price set successfully!');
            } else {
                console.error('Failed to set payment token and price:', receipt);
                alert('Failed to set payment token and price.');
            }

        } catch (error) {
            console.error('Error setting payment token and price:', error);
            alert('Error setting payment token and price. See console for details.');
        }
    };

    const handleNameChange = (event) => setName(event.target.value);
    const handleDescriptionChange = (event) => setDescription(event.target.value);
    const handleFileChange = (event) => setFile(event.target.files[0]);

    const handlePaymentTypeChange = (event) => {
        setPaymentType(event.target.value);
        // If ERC20 is selected, set isERC20Payment to true
        setIsERC20Payment(event.target.value === 'ERC20');
    };


    const approveERC20Payment = async () => {
        console.log(`Approving ERC20 payment. Token Address: ${erc20Address}, Price: ${price}`);
        const erc20Contract = new ethers.Contract(erc20Address, ERC20_ABI.abi, signer);
        const approvalTx = await erc20Contract.approve(contractAddress, price);
        console.log('Approval transaction:', approvalTx);
    };

    const mintNFT = async (metadataUri, collectionAddress, _symbol) => {
        if (!signer) {
            alert('Please connect your wallet first.');
            return;
        }

        console.log(`Starting the minting process with metadata URI: ${metadataUri} on collection: ${collectionAddress}`);

        const collectionContract = new ethers.Contract(collectionAddress, COLLECTION_ABI.abi, signer);
        //const contract = getContract(signer);
        console.log(`Minting NFT with metadata URI: ${metadataUri} for address: ${signer.getAddress()}`);
        //let mintTxResponse;
        try {
            console.log(`Checking payment type for minting process...`);
            if (isERC20Payment) {
                console.log(`Minting with ERC20 token. Approving token address ${erc20Address} to spend ${price}`);

                const erc20Contract = new ethers.Contract(erc20Address, ERC20_ABI.abi, signer);
                const approvalTx = await erc20Contract.approve(collectionAddress, price);
                console.log('ERC20 Approval transaction:', approvalTx);

                const approvalReceipt = await approvalTx.wait();
                console.log('ERC20 Approval transaction receipt:', approvalReceipt);


                console.log(`ERC20 token approved. Proceeding with minting the NFT using metadata URI: ${metadataUri}`);
                const mintTx = await collectionContract.mintWithERC20(metadataUri, _symbol, { gasLimit: 500000 });
                console.log('Mint transaction submitted:', mintTx);

                //await approveERC20Payment(); // Assuming this function is already defined to handle approval
                console.log(`Minting NFT with ERC20 token. Metadata URI: ${metadataUri}, Price: ${price}`);
                //const mintTxResponse = await contract.mintWithERC20(metadataUri, { gasLimit: 500000 });
                console.log('Mint transaction submitted with ERC20:', mintTx);

                // Wait for the transaction to be mined
                const receipt = await mintTx.wait();
                console.log('Mint transaction receipt:', receipt);

                if (receipt.status === 0) {
                    // Transaction failed
                    console.error('Minting transaction failed:', receipt);
                    alert('Minting transaction failed. Check the console for more details.');
                } else {
                    console.log(`NFT minted successfully with ERC20 token. Transaction hash: ${receipt.transactionHash}`);
                    setTimeout(() => {
                        alert('NFT minted successfully!');
                    }, 3000);
                    onNFTMinted();  // Invoke the refresh function
                }

            } else {
                console.log('Minting NFT with ETH.');
                const mintTx = await collectionContract.mintWithETH(metadataUri, _symbol, { value: 0 });
                //const mintTx = await contract.mint(signer.getAddress(), metadataUri);
                console.log('Mint transaction with ETH:', mintTx, 'and meta data URI', metadataUri);

                const receipt = await mintTx.wait();
                console.log('ETH Mint transaction receipt:', receipt);

                if (receipt.status === 0) {
                    // Transaction failed
                    console.error('Minting transaction failed:', receipt);
                    alert('Minting transaction failed. Check the console for more details.');
                } else {
                    console.log(`NFT minted successfully with ETH. Transaction hash: ${receipt.transactionHash}`);
                    setTimeout(() => {
                        alert('NFT minted successfully!');
                    }, 3000);
                    onNFTMinted();  // Invoke the refresh function
                    console.log(`NFT minted successfully!`);
                }
            }
            onDeploymentStarted(true);
        } catch (error) {
            console.error('Error during the minting process:', error);
            if (error.transactionHash) {
                console.log(`Transaction hash for failed minting: ${error.transactionHash}`);
                const receipt = await signer.provider.getTransactionReceipt(error.transactionHash);
                if (receipt && receipt.status === 0) {
                    try {
                        const code = await signer.provider.call({ ...error.transaction, from: error.transaction.from }, receipt.blockNumber);
                        console.log('Revert reason obtained:', ethers.utils.toUtf8String('0x' + code.substr(138)));
                    } catch (errorOfError) {
                        console.error('Error while trying to get revert reason:', errorOfError);
                    }
                }
            }
            alert('Error minting NFT. See console for details.');
            setIsDeploying(false);
        }
    };

    const getCurrentDate = () => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const year = today.getFullYear();
        return `${month}-${day}-${year}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (file && name && description && signer) {
            setIsDeploying(true);
            const collectionAddress = await createCollection();

            if (!collectionAddress) {
                setIsDeploying(false);
                alert('No collection address provided.');
                return; // Exit if failed to create collection
            }

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
                            "value": getCurrentDate()
                        },
                        {
                            "trait_type": "Medium",
                            "value": "Digital"
                        },
                        {
                            "trait_type": "Payment Type",
                            "value": paymentType === 'ERC20' ? 'ERC20' : 'ETH'
                        }
                    ],
                };
                const metadataCID = await saveMetadataToIPFS(metadata);
                await mintNFT(`ipfs://${metadataCID}`, collectionAddress, symbol);
                setIsDeploying(false);
                console.log(`After Minting NFT Finished`);
            } catch (error) {
                console.error('Error in the NFT creation process:', error);
                alert('Error in the NFT creation process. See console for details.');
                setIsDeploying(false);
            }
        } else {
            alert('Please provide all required fields and make sure your wallet is connected.');
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
                <label htmlFor="symbol">Symbol</label>
                <input type="text" id="symbol" placeholder="Collection Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
                <label htmlFor="paymentType">Payment Type</label>
                <select id="paymentType" value={paymentType} onChange={handlePaymentTypeChange}>
                    <option value="ETH">Ethereum</option>
                    <option value="ERC20">ERC20 Token</option>
                </select>
                {paymentType === 'ERC20' && (
                    <>
                        <label htmlFor="erc20Address">ERC20 Token Address</label>
                        <input
                            type="text"
                            id="erc20Address"
                            placeholder="ERC20 Token Contract Address"
                            value={erc20Address}
                            onChange={(e) => setERC20Address(e.target.value)}
                            required
                        />
                        <label htmlFor="price">Price</label>
                        <input
                            type="text"
                            id="price"
                            placeholder="Price for NFT (in ETH)"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                        <button type="button" onClick={setPaymentTokenAndPrice} disabled={isDeploying}>
                            Set ERC20 Token and Price
                        </button>
                    </>
                )}
                <button type="submit" className="nft-form-button" disabled={isDeploying}>
                    Mint NFT
                </button>
            </form>
        </div>
    );
};

export default NFTForm;
