// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Settlement is Ownable {
    IERC20 public paymentToken;
    
    event PaymentProcessed(address indexed payer, address indexed payee, uint256 amount, uint256 timestamp);

    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
    }

    function processPayment(address from, address to, uint256 amount) external {
        // In a real system, this might be called by the P2PTrading contract
        // For now, we allow anyone to trigger it if they have allowance, 
        // but typically you'd restrict this to authorized contracts.
        
        require(paymentToken.transferFrom(from, to, amount), "Transfer failed");
        emit PaymentProcessed(from, to, amount, block.timestamp);
    }
}
