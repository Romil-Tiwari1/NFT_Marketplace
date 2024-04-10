import React from 'react';
import ReactDOM from 'react-dom';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { ContractProvider } from './contexts/ContractContext';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import App from './App';
import './index.css';

const sepoliaChain = {
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: 'https://sepolia.infura.io/v3/cc0c53eb9b624ac595bc708575bbeed5',
  },
  blockExplorers: {
    default: { name: 'Sepolia Explorer', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
};

const { provider, chains } = configureChains(
  [sepoliaChain],
  [jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default }) })]
);

const client = createClient({
  autoConnect: true,
  provider,
  chains,
});

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <ContractProvider>
        <App />
      </ContractProvider>
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById('root')
);
