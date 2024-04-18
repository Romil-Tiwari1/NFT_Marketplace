// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "src/CollectionNFT.sol";

contract NFTFactory {
    event CollectionCreated(address indexed collectionAddress);

    function createCollection(
        string memory name,
        string memory symbol,
        address paymentToken, // Optional address for ERC20 payment
        uint256 price // Optional price for ERC20 payment
    ) public returns (address) {
        CollectionNFT collection = new CollectionNFT(name, symbol, paymentToken, price);
        emit CollectionCreated(address(collection));
        return address(collection);
    }
}
