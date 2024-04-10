// deployContract.js
require('dotenv').config();
const { ethers } = require("ethers");
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');

const rpcURL = process.env.RPC_URL;
const privateKey = process.env.NFT_PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(rpcURL);
const wallet = new ethers.Wallet(privateKey, provider);

// Add your contractABI here as in mintNFT.js
const contractABI = [
    "function mint(address to, string memory tokenURI) external",
];

const execPromise = util.promisify(exec);

async function mintNFT(contractAddress, toAddress, tokenURI) {
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
    try {
        // Update the mint function call to include the tokenURI
        const tx = await contract.mint(toAddress, tokenURI);
        console.log("Transaction submitted! Hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed! Block number:", receipt.blockNumber);
    } catch (error) {
        console.error("Minting failed:", error);
    }
}

async function deployContract(metadataURI) {
    const constructorArg = `constructor(string memory) "${metadataURI}"`;
    const encodeCommand = `cast abi-encode "constructor(string)" "${metadataURI}"`;

    try {
        const { stdout: encodedArgs } = await execPromise(encodeCommand);
        const constructorArgument = encodedArgs.trim();

        const createCommand = `forge create src/contracts/MyNFT.sol:MyNFT --rpc-url ${rpcURL} --private-key ${privateKey} --constructor-args ${constructorArgument}`;
        const { stdout } = await execPromise(createCommand);

        console.log(`Deployment Stdout: ${stdout}`);

        // Extract the deployed contract address from the output
        const deployedAddressMatch = stdout.match(/Deployed to: (0x[a-fA-F0-9]{40})/);
        if (deployedAddressMatch && deployedAddressMatch[1]) {
            const deployedAddress = deployedAddressMatch[1];
            console.log(`Contract deployed to: ${deployedAddress}`);

            // Write the deployed contract address to a file
            const addressPath = path.join(__dirname, '../../deployedAddress.json');
            fs.writeFileSync(addressPath, JSON.stringify({ address: deployedAddress }));


            // Proceed with minting
            const toAddress = process.env.WALLET_ADDRESS;
            await mintNFT(deployedAddress, process.env.WALLET_ADDRESS, `ipfs://${metadataURI}`);
        } else {
            console.error('Could not find deployed contract address in output.');
        }
    } catch (error) {
        console.error('Error deploying contract or minting NFT:', error);
    }
}

module.exports = deployContract;
