// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract P2PTrading is ReentrancyGuard, Ownable {
    
    IERC20 public energyToken;

    struct Listing {
        uint256 id;
        address seller;
        uint256 energyAmount; // in kWh
        uint256 pricePerUnit; // in EnergyToken wei
        bool active;
    }

    struct Transaction {
        uint256 id;
        uint256 listingId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 totalPrice;
        uint256 timestamp;
    }

    uint256 public nextListingId;
    uint256 public nextTransactionId;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public userTransactions;

    event EnergyListed(uint256 indexed listingId, address indexed seller, uint256 amount, uint256 price);
    event EnergySold(uint256 indexed transactionId, uint256 indexed listingId, address indexed buyer, address seller, uint256 amount, uint256 totalPrice);
    event ListingCancelled(uint256 indexed listingId);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        energyToken = IERC20(_tokenAddress);
    }

    function listEnergy(uint256 _energyAmount, uint256 _pricePerUnit) external {
        require(_energyAmount > 0, "Amount must be greater than 0");
        require(_pricePerUnit > 0, "Price must be greater than 0");

        listings[nextListingId] = Listing({
            id: nextListingId,
            seller: msg.sender,
            energyAmount: _energyAmount,
            pricePerUnit: _pricePerUnit,
            active: true
        });

        userListings[msg.sender].push(nextListingId);
        emit EnergyListed(nextListingId, msg.sender, _energyAmount, _pricePerUnit);
        nextListingId++;
    }

    function buyEnergy(uint256 _listingId, uint256 _amountToBuy) external nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.active, "Listing is not active");
        require(listing.energyAmount >= _amountToBuy, "Insufficient energy available");
        require(msg.sender != listing.seller, "Cannot buy your own energy");

        uint256 totalPrice = _amountToBuy * listing.pricePerUnit;
        
        // Check allowance and balance
        require(energyToken.balanceOf(msg.sender) >= totalPrice, "Insufficient token balance");
        require(energyToken.allowance(msg.sender, address(this)) >= totalPrice, "Insufficient allowance");

        // Transfer tokens from buyer to seller
        bool success = energyToken.transferFrom(msg.sender, listing.seller, totalPrice);
        require(success, "Token transfer failed");

        // Update listing
        listing.energyAmount -= _amountToBuy;
        if (listing.energyAmount == 0) {
            listing.active = false;
        }

        // Record transaction
        transactions[nextTransactionId] = Transaction({
            id: nextTransactionId,
            listingId: _listingId,
            buyer: msg.sender,
            seller: listing.seller,
            amount: _amountToBuy,
            totalPrice: totalPrice,
            timestamp: block.timestamp
        });

        userTransactions[msg.sender].push(nextTransactionId);
        userTransactions[listing.seller].push(nextTransactionId);

        emit EnergySold(nextTransactionId, _listingId, msg.sender, listing.seller, _amountToBuy, totalPrice);
        nextTransactionId++;
    }

    function cancelListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        require(msg.sender == listing.seller, "Only seller can cancel");
        require(listing.active, "Listing already inactive");

        listing.active = false;
        emit ListingCancelled(_listingId);
    }

    function getListing(uint256 _listingId) external view returns (Listing memory) {
        return listings[_listingId];
    }
}
