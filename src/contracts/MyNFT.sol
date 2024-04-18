// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "src/tokens/ERC721.sol";
import "src/tokens/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyNFT is ERC721 {
     using Strings for uint256;

    // Events for logging
    event PaymentTokenAddressSet(address tokenAddress);
    event PriceSet(uint256 price);
    event TreasurySet(address treasuryAddress);
    event PaymentReceived(address from, uint256 amount);
    event MintedWithERC20(address to, uint256 tokenId, string tokenURI);
    event Error(string message);

    uint256 private _totalSupply = 0;
    uint256 public nextTokenId = 1;
    address public admin;
    mapping(uint256 => string) private _tokenURIs;

    address payable public treasury; // Address where funds will be sent
    IERC20 public paymentToken; // The ERC20 token that will be accepted for payments
    uint256 public price; // Price per NFT in ERC20 tokens

    constructor() ERC721("MyNFT", "MNFT") {
        admin = msg.sender;
        treasury = payable(msg.sender);
        emit TreasurySet(treasury);
    }

    // Function to set the ERC20 token used for payments and the price per NFT
    function setPaymentTokenAndPrice(address _tokenAddress, uint256 _price) external {
        require(msg.sender == admin, "Only admin can set token and price");
        paymentToken = IERC20(_tokenAddress); // Set the payment token address
        emit PaymentTokenAddressSet(_tokenAddress);

        price = _price; // Set the price per NFT
        emit PriceSet(_price);
    }

    function mint(address to, string memory tokenURI) public {
        _totalSupply++;
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function mintWithERC20(string memory tokenURI) public {
        uint256 allowance = paymentToken.allowance(msg.sender, address(this));
        if(allowance < price) {
            emit Error("Allowance too low");
            revert("Allowance too low");
        }

        uint256 balance = paymentToken.balanceOf(msg.sender);
        if(balance < price) {
            emit Error("Balance too low");
            revert("Balance too low");
        }

        bool sent = paymentToken.transferFrom(msg.sender, treasury, price);
        if(!sent) {
            emit Error("Payment failed");
            revert("Payment failed");
        }
        
        emit PaymentReceived(msg.sender, price);

        _totalSupply++;
        uint256 tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit MintedWithERC20(msg.sender, tokenId, tokenURI);
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