// src/contexts/ContractContext.js
import React, { createContext, useContext, useState } from 'react';

const ContractContext = createContext();

export const useContract = () => useContext(ContractContext);

export const ContractProvider = ({ children }) => {
    const [contractAddress, setContractAddress] = useState(null);

    return (
        <ContractContext.Provider value={{ contractAddress, setContractAddress }}>
            {children}
        </ContractContext.Provider>
    );
};
