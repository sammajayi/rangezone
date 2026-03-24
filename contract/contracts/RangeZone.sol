// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

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

contract RangeZone {
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

    mapping(uint8 => mapping(address => uint256)) public stakes;

    mapping(uint8 => uint256) public bracketTotals;

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
    ) external onlyOwner {
        require(
            market.state == MarketState.Closed || market.expiry == 0,
            "Market already active"
        );
        require(_threshold1 > 0, "Threshold1 must be greater than 0");
        require(
            _threshold2 > _threshold1,
            "Threshold2 must be greater than threshold1"
        );

        (, int256 price, , , ) = priceFeed.latestRoundData();
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
        emit MarketCreated(price, market.expiry, _threshold1, _threshold2);
    }

    // to stake
    function stake(
        uint8 _bracket
    ) external payable onlyState(MarketState.Open) {
        require(block.timestamp < market.expiry, "Market expired");
        require(_bracket <= 2, "Invalid bracket");
        require(msg.value > 0, "No stake sent");

        stakes[_bracket][msg.sender] += msg.value;
        bracketTotals[_bracket] += msg.value;
        market.totalPool += msg.value;

        emit Staked(msg.sender, _bracket, msg.value);
    }

    // resolve market
    function resolve() external {
        require(block.timestamp >= market.expiry, "Not yet expired");
        require(market.state == MarketState.Open, "Already resolved");

        (, int256 endPrice, , , ) = priceFeed.latestRoundData();
        market.endPrice = endPrice;
        market.state = MarketState.Resolved;

        // track fee separately
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

    function claim() external onlyState(MarketState.Resolved) {
        uint8 winner = market.winningBracket;
        uint256 userStake = stakes[winner][msg.sender];
        require(userStake > 0, "Nothing to claim");

        stakes[winner][msg.sender] = 0;

        uint256 poolAfterFee = (market.totalPool * (100 - FEE)) / 100;
        uint256 payout = (userStake * poolAfterFee) / bracketTotals[winner];

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
