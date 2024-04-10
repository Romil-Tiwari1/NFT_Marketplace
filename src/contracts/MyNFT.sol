// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "src/tokens/ERC721.sol";
import "src/tokens/Strings.sol";

contract MyNFT is ERC721 {
    using Strings for uint256;

    uint256 private _totalSupply = 0;
    uint256 public nextTokenId = 1;
    address public admin;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("MyNFT", "MNFT") {
        admin = msg.sender;
    }

    function mint(address to, string memory tokenURI) public {
        require(msg.sender == admin, "only admin can mint");
        _totalSupply++;
        uint256 tokenId = nextTokenId;
        nextTokenId++; // Increment after minting
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function _setTokenURI(uint256 tokenId, string memory tokenURI) private {
        _tokenURIs[tokenId] = tokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
}