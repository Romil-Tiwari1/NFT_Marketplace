# NFT Marketplace

This project is a decentralized NFT Marketplace allowing users to create their own NFT collection from images, store them on IPFS, and view them in a single view. Built with React, Web3, and utilizing IPFS for decentralized storage, it showcases a practical application of blockchain technology and decentralized file storage.

## Features

- **Create NFT**: Users can create their own NFTs by uploading images and adding metadata.
- **Decentralized Storage**: Images and metadata are stored on IPFS, ensuring data is distributed and resilient.
- **View Collection**: Users can view their uploaded NFTs in a single, integrated view.
- **Blockchain Integration**: Utilizes smart contracts for NFT minting and management (Note: Detail your blockchain setup).

## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed the latest version of [Node.js](https://nodejs.org/) and npm.
- You have installed [IPFS](https://ipfs.io/) on your machine.
- You have an account on [ngrok](https://ngrok.com/) and have installed the ngrok tool.


## Setup and Installation

1. **Install Dependencies**
npm install

2. **Set Up Environment Variables:**
Create a `.env` file in the project root and configure your environment variables.
Add your IPFS API credentials and any blockchain-related configurations.

3. **Start the Development Server:**
npm start

## Project Run Status
This section outlines the necessary steps to run and deploy the React app and server, including generating a build, hosting on IPFS and ngrok, and configuring IPFS settings. Follow these steps to deploy your project successfully.

### Step 1: Build the React App

-  Generate a build for your React app by running the following command in your terminal: 
   bash npm run build

### Step 2: Upload Build to IPFS
- After generating the build, upload it to IPFS to get a link for your project. The IPFS link acts as a decentralized hosting URL for your project.

### Step 3: Host Your Server on Ngrok
- Deploy your server using ngrok, which allows you to expose your local server to the internet. Hosting on ngrok provides you with a public URL for your server.

### Step 4: Configure IPFS
- Perform the following commands in your terminal to configure IPFS for your project. These commands set up the necessary access control headers and restart the IPFS daemon with the new configuration.

- Update the IPFS configuration to allow access from your project URLs: ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://<your-ipfs-host-link>.ipfs.localhost:48084", "http://localhost:3000", "http://127.0.0.1:5001", "https://webui.ipfs.io", "http://127.0.0.1:8080", "http://localhost:3001"]'
- Allow specific HTTP methods for your IPFS node: ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
- Restart the IPFS daemon to apply changes: ipfs shutdown & ipfs daemon
  
### Step 5: Run and Verify
- With your server hosted and IPFS configured, access your project through the IPFS URL to see if the NFT is generated correctly. This step verifies that your project is set up and running as expected on a decentralized platform.

By following these steps, you deploy your React app and server in a decentralized environment, ensuring your project is accessible and functional.

## Usage
After starting the development server, the application will be available at IPFS URl where your build is uploaded.

To create an NFT, navigate to the "Create NFT" section, fill in the details, and upload an image.
Your NFT collection can be viewed in the "My Collection" section, showcasing all uploaded items.

## Team Members:
Romil Tiwari | tiwari.rom@northeastern.edu
Anuja Shinde | shinde.anuj@northeastern.edu

## IPFS URL: https://ipfs.io/ipfs/QmZ1kwiwmVCrbUCh2ztN9vZX52UNwxfbKuQ4qjagyjeEzU