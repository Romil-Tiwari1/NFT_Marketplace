// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "src/BaseNFT.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CollectionNFT
 * CollectionNFT - a contract for NFT collections.
 */
contract CollectionNFT is BaseNFT {
    // Events for logging
    event PaymentTokenAddressSet(address tokenAddress);
    event PriceSet(uint256 price);
    event TreasurySet(address treasuryAddress);
    event PaymentReceived(address from, uint256 amount);
    event MintedWithERC20(address to, uint256 tokenId, string tokenURI);
    event Error(string message);

    IERC20 public paymentToken;
    uint256 public price;
    uint256 private _totalSupply = 0;
    uint256 public nextTokenId = 1;
    address public admin;
    mapping(uint256 => string) private _tokenURIs;

    // Mapping to store individual symbols for each token
    mapping(uint256 => string) private _tokenSymbols;


    constructor(
        string memory name,
        string memory symbol,
        address _paymentToken,
        uint256 _price
    ) BaseNFT(name, symbol) Ownable(msg.sender) { // Pass msg.sender to Ownable
        paymentToken = IERC20(_paymentToken);
        price = _price;
        admin = msg.sender;
    }
    

    function mintWithETH(string memory _tokenURI, string memory _tokenSymbol) public payable {
        require(msg.value >= price, "Insufficient ETH sent");
        uint256 tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        _totalSupply++;
        _tokenSymbols[tokenId] = _tokenSymbol; // Use the _tokenSymbol parameter
    }

    // Function to set the ERC20 token used for payments and the price per NFT
    function setPaymentTokenAndPrice(address _tokenAddress, uint256 _price) external {
        require(msg.sender == admin, "Only admin can set token and price");
        paymentToken = IERC20(_tokenAddress); // Set the payment token address
        emit PaymentTokenAddressSet(_tokenAddress);

        price = _price; // Set the price per NFT
        emit PriceSet(_price);
    }

    function mintWithERC20(string memory _tokenURI, string memory _tokenSymbol) public {
        // Check if the user has enough allowance
        uint256 allowance = paymentToken.allowance(msg.sender, address(this));
        require(allowance >= price, "ERC20 allowance too low");

        // Check if the user has enough token balance
        uint256 balance = paymentToken.balanceOf(msg.sender);
        require(balance >= price, "Insufficient token balance");

        // Transfer tokens from user to contract
        require(paymentToken.transferFrom(msg.sender, address(this), price), "Payment failed");

        uint256 tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        _totalSupply++;
        _tokenSymbols[tokenId] = _tokenSymbol;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function _setTokenURI(uint256 tokenId, string memory tokenURI) internal override {
        require(tokenExists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = tokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenExists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    // Function to get the symbol for a specific tokenId
    function tokenSymbol(uint256 tokenId) public view returns (string memory) {
        require(tokenExists(tokenId), "Token does not exist.");
        return _tokenSymbols[tokenId];
    }
}
