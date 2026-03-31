[dotenv@17.3.1] injecting env (3) from .env -- tip: ⚙️  override existing env vars with { override: true }
// Sources flattened with hardhat v2.28.6 https://hardhat.org

// SPDX-License-Identifier: MIT

// File contracts/MockPriceFeed.sol

// Original license: SPDX_License_Identifier: MIT
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
