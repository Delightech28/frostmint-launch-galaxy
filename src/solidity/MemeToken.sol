// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MemeToken is ERC20 {
    uint256 public taxRate; // in basis points (e.g., 200 = 2%)
    address public taxReceiver;

    constructor(
        string memory name,
        string memory ticker,
        uint256 initialSupply,
        address owner,
        uint256 _taxRate,
        address _taxReceiver
    ) ERC20(name, ticker) {
        _mint(owner, initialSupply);
        taxRate = _taxRate;
        taxReceiver = _taxReceiver;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal override {
        if (taxRate > 0 && taxReceiver != address(0) && sender != taxReceiver) {
            uint256 taxAmount = (amount * taxRate) / 10000;
            uint256 sendAmount = amount - taxAmount;
            super._transfer(sender, taxReceiver, taxAmount);
            super._transfer(sender, recipient, sendAmount);
        } else {
            super._transfer(sender, recipient, amount);
        }
    }
}

contract MemeTokenFactory {
    address public owner;
    uint256 public mintFee = 0.01 ether; // Users must pay 0.01 AVAX to mint
    address public feeReceiver;

    event TokenCreated(address indexed tokenAddress, address indexed owner);

    constructor(address _feeReceiver) {
        owner = msg.sender;
        feeReceiver = _feeReceiver;
    }

    function setMintFee(uint256 newFee) external {
        require(msg.sender == owner, "Only owner can set fee");
        mintFee = newFee;
    }

    function setFeeReceiver(address newReceiver) external {
        require(msg.sender == owner, "Only owner can set receiver");
        feeReceiver = newReceiver;
    }

    function createToken(
        string memory name,
        string memory ticker,
        uint256 initialSupply,
        uint256 taxRate, // in basis points (e.g., 200 = 2%)
        address taxReceiver
    ) external payable {
        require(msg.value >= mintFee, "Insufficient minting fee");

        // Send fee to your wallet
        payable(feeReceiver).transfer(msg.value);

        // Create new token and assign to user
        MemeToken newToken = new MemeToken(name, ticker, initialSupply, msg.sender, taxRate, taxReceiver);
        emit TokenCreated(address(newToken), msg.sender);
    }
} 