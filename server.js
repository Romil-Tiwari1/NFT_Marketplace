// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const deployContract = require('./src/utils/deployContract');
const app = express();
const port = 3001;

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:8080',
        /\.ipfs\.localhost(:\d+)?$/, // This regex will match all subdomains for .ipfs.localhost
        /\.ngrok-free\.app$/, // This regex will match all subdomains for .ngrok-free.app
    ],
    credentials: true // if you need to support credentials
}));

//Use express server
app.use(express.json());

//Deploy Contract
app.post('/deploy', (req, res) => {
    console.log(`Received request to deploy contract with metadata URI: ${req.body.metadataURI}`);
    deployContract(req.body.metadataURI);
    res.send('Deployment process started.');
});

// New endpoint to get the deployed contract address
app.get('/getDeployedAddress', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    const addressPath = path.resolve('deployedAddress.json');

    if (!fs.existsSync(addressPath)) {
        return res.status(404).send({ error: 'Contract address not found.' });
    }

    try {
        const data = fs.readFileSync(addressPath, 'utf8');
        const { address } = JSON.parse(data);
        res.send({ address });
    } catch (error) {
        console.error('Error reading or parsing deployedAddress.json:', error);
        res.status(500).send({ error: 'Server error' });
    }
});

//Fetch IPFS hosted with CID
app.get('/ipfs/:cid', async (req, res) => {
    const { cid } = req.params;
    // Use the local IPFS gateway URL
    const ipfsUrl = `http://127.0.0.1:8080/ipfs/${cid}`;

    try {
        // Removed the timeout logic for brevity, but you can include it if needed
        const response = await fetch(ipfsUrl);
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching IPFS data:', error);
        res.status(500).json({ error: 'Failed to fetch IPFS data' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
