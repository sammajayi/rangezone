// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockPriceFeed {
    int256 private price = 3000000000000;
    uint256 private updatedAt;

    constructor() {
        updatedAt = block.timestamp;
    }

    function setPrice(int256 _price) external {
        price = _price;
        updatedAt = block.timestamp;
    }

    function setPriceWithTimestamp(int256 _price, uint256 _updatedAt) external {
        price = _price;
        updatedAt = _updatedAt;
    }

    function latestRoundData() external view returns (
        uint80, int256, uint256, uint256, uint80
    ) {
        return (0, price, 0, updatedAt, 0);
    }
}