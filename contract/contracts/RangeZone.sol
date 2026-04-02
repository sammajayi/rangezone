// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract RangeZone is ReentrancyGuard {
    enum MarketState {
        Open,
        Closed,
        Resolved
    }

    struct Market {
        int256 startPrice;
        int256 endPrice;
        uint256 expiry;
        uint256 totalPool;
        uint8 winningBracket;
        MarketState state;
        uint256 threshold1;
        uint256 threshold2;
    }

    AggregatorV3Interface public priceFeed;
    address public owner;
    uint256 public constant FEE = 5;
    uint256 public accumulatedFee;
    uint256 public marketCount;
    uint256 public maxPriceAge;
    

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(uint8 => mapping(address => uint256))) public stakes;
    mapping(uint256 => mapping(uint8 => uint256)) public bracketTotals;

    event MarketCreated(
        uint256 indexed marketId,
        int256 startPrice,
        uint256 expiry,
        uint256 threshold1,
        uint256 threshold2
    );
    event Staked(
        uint256 indexed marketId,
        address indexed user,
        uint8 bracket,
        uint256 amount
    );
    event Resolved(
        uint256 indexed marketId,
        uint8 winningBracket,
        int256 endPrice
    );
    event Claimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _priceFeed, uint256 _maxPriceAge) {
        priceFeed = AggregatorV3Interface(_priceFeed);
        owner = msg.sender;
        maxPriceAge = _maxPriceAge;
    }

    function createMarket(
        uint256 _duration,
        uint256 _threshold1,
        uint256 _threshold2
    ) external onlyOwner {
        require(_threshold1 > 0, "Threshold1 must be greater than 0");
        require(
            _threshold2 > _threshold1,
            "Threshold2 must be greater than threshold1"
        );

        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price");
        require(updatedAt > 0, "Stale price");
        require(block.timestamp - updatedAt <= maxPriceAge, "Price too old");

        marketCount++;
        markets[marketCount] = Market({
            startPrice: price,
            endPrice: 0,
            expiry: block.timestamp + _duration,
            totalPool: 0,
            winningBracket: 0,
            state: MarketState.Open,
            threshold1: _threshold1,
            threshold2: _threshold2
        });

        emit MarketCreated(marketCount, price, markets[marketCount].expiry, _threshold1, _threshold2);
    }

    function stake(uint256 _marketId, uint8 _bracket) external payable {
        Market storage m = markets[_marketId];
        require(m.state == MarketState.Open, "Market not open");
        require(block.timestamp < m.expiry, "Market expired");
        require(_bracket <= 2, "Invalid bracket");
        require(msg.value > 0, "No stake sent");

        stakes[_marketId][_bracket][msg.sender] += msg.value;
        bracketTotals[_marketId][_bracket] += msg.value;
        m.totalPool += msg.value;

        emit Staked(_marketId, msg.sender, _bracket, msg.value);
    }

    function resolve(uint256 _marketId) external {
        Market storage m = markets[_marketId];
        require(m.expiry > 0, "Market does not exist");
        require(block.timestamp >= m.expiry, "Not yet expired");
        require(m.state == MarketState.Open, "Already resolved");
        require(m.startPrice > 0, "Invalid start price");

        (, int256 endPrice, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        require(endPrice > 0, "Invalid end price");
        require(updatedAt > 0, "Stale price");
        require(block.timestamp - updatedAt <= maxPriceAge, "Price too old");

        m.endPrice = endPrice;
        m.state = MarketState.Resolved;

        uint256 fee = (m.totalPool * FEE) / 100;
        accumulatedFee += fee;

        int256 diff = endPrice - m.startPrice;
        if (diff < 0) diff = -diff;
        uint256 pct = (uint256(diff) * 100) / uint256(m.startPrice);

        if (pct < m.threshold1) {
            m.winningBracket = 0;
        } else if (pct < m.threshold2) {
            m.winningBracket = 1;
        } else {
            m.winningBracket = 2;
        }

        emit Resolved(_marketId, m.winningBracket, endPrice);
    }

    function claim(uint256 _marketId) external nonReentrant {
        Market storage m = markets[_marketId];
        require(m.state == MarketState.Resolved, "Market not resolved");

        uint8 winner = m.winningBracket;
        uint256 userStake = stakes[_marketId][winner][msg.sender];
        require(userStake > 0, "Nothing to claim");

        stakes[_marketId][winner][msg.sender] = 0;

        uint256 poolAfterFee = (m.totalPool * (100 - FEE)) / 100;
        uint256 payout = (userStake * poolAfterFee) / bracketTotals[_marketId][winner];

        (bool sent, ) = msg.sender.call{value: payout}("");
        require(sent, "Transfer failed");

        emit Claimed(_marketId, msg.sender, payout);
    }

    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }

    function getCurrentMarket() external view returns (uint256 id, Market memory m) {
        return (marketCount, markets[marketCount]);
    }

    function withdrawFee() external onlyOwner {
        uint256 amount = accumulatedFee;
        require(amount > 0, "No fee to withdraw");
        accumulatedFee = 0;
        (bool sent, ) = owner.call{value: amount}("");
        require(sent, "Withdraw failed");
    }
}