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
        uint256 threshold1; // e.g. 3 means 0-3% is bracket 0
        uint256 threshold2; // e.g. 7 means 3-7% is bracket 1, 7%+ is bracket 2
    }

    Market public market;
    AggregatorV3Interface public priceFeed;
    address public owner;
    uint256 public constant FEE = 5; // 5% protocol fee
    uint256 public accumulatedFee;
    uint256 public marketCount;

    mapping(uint256 => mapping(uint8 => mapping(address => uint256)))
        public stakes;
    mapping(uint256 => mapping(uint8 => uint256)) public bracketTotals;

    event MarketCreated(
        int256 startPrice,
        uint256 expiry,
        uint256 threshold1,
        uint256 threshold2
    );
    event Staked(address indexed user, uint8 bracket, uint256 amount);
    event Resolved(uint8 winningBracket, int256 endPrice);
    event Claimed(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyState(MarketState _state) {
        require(market.state == _state, "Invalid market state");
        _;
    }

    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
        owner = msg.sender;
    }

    // Cretae market
    function createMarket(
        uint256 _duration,
        uint256 _threshold1,
        uint256 _threshold2
    ) external {
       require(
        market.state == MarketState.Closed ||
        market.state == MarketState.Resolved ||
        market.expiry == 0,
        "Market already active"
    );
        require(_threshold1 > 0, "Threshold1 must be greater than 0");
        require(
            _threshold2 > _threshold1,
            "Threshold2 must be greater than threshold1"
        );

        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price");
        require(updatedAt > 0, "Stale price");
        require(block.timestamp - updatedAt <= 24 hours, "Price too old");
        market = Market({
            startPrice: price,
            endPrice: 0,
            expiry: block.timestamp + _duration,
            totalPool: 0,
            winningBracket: 0,
            state: MarketState.Open,
            threshold1: _threshold1,
            threshold2: _threshold2
        });
        marketCount++;
        emit MarketCreated(price, market.expiry, _threshold1, _threshold2);
    }

    // to stake
    function stake(
        uint8 _bracket
    ) external payable onlyState(MarketState.Open) {
        require(block.timestamp < market.expiry, "Market expired");
        require(_bracket <= 2, "Invalid bracket");
        require(msg.value > 0, "No stake sent");

        stakes[marketCount][_bracket][msg.sender] += msg.value;
        bracketTotals[marketCount][_bracket] += msg.value;
        market.totalPool += msg.value;
        emit Staked(msg.sender, _bracket, msg.value);
    }

    // resolve market
    function resolve() external {
    require(block.timestamp >= market.expiry, "Not yet expired");
    require(market.state == MarketState.Open, "Already resolved");
    require(market.startPrice > 0, "Invalid start price");

    (, int256 endPrice, , uint256 updatedAt, ) = priceFeed.latestRoundData();
    require(endPrice > 0, "Invalid end price");
    require(updatedAt > 0, "Stale price");
    require(block.timestamp - updatedAt <= 24 hours, "Price too old");

    market.endPrice = endPrice;
    market.state = MarketState.Resolved;

    uint256 fee = (market.totalPool * FEE) / 100;
    accumulatedFee += fee;

    int256 diff = endPrice - market.startPrice;
    if (diff < 0) diff = -diff;
    uint256 pct = (uint256(diff) * 100) / uint256(market.startPrice);

    if (pct < market.threshold1) {
        market.winningBracket = 0;
    } else if (pct < market.threshold2) {
        market.winningBracket = 1;
    } else {
        market.winningBracket = 2;
    }
    emit Resolved(market.winningBracket, endPrice);
}

    // claim winnings

    function claim() external onlyState(MarketState.Resolved) nonReentrant {
        uint8 winner = market.winningBracket;
        uint256 userStake = stakes[marketCount][winner][msg.sender];
        require(userStake > 0, "Nothing to claim");

        stakes[marketCount][winner][msg.sender] = 0;

        uint256 poolAfterFee = (market.totalPool * (100 - FEE)) / 100;
        uint256 payout = (userStake * poolAfterFee) /
            bracketTotals[marketCount][winner];

        (bool sent, ) = msg.sender.call{value: payout}("");
        require(sent, "Transfer failed");

        emit Claimed(msg.sender, payout);
    }

    function getMarketInfo() external view returns (Market memory) {
        return market;
    }

    // to withdraw winnings
    function withdrawFee() external onlyOwner {
        uint256 amount = accumulatedFee;
        require(amount > 0, "No fee to withdraw");

        accumulatedFee = 0;

        (bool sent, ) = owner.call{value: amount}("");
        require(sent, "Withdraw failed");
    }
}
