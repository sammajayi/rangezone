
// Sources flattened with hardhat v2.28.6 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/StorageSlot.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/StorageSlot.sol)
// This file was procedurally generated from scripts/generate/templates/StorageSlot.js.

pragma solidity ^0.8.20;

/**
 * @dev Library for reading and writing primitive types to specific storage slots.
 *
 * Storage slots are often used to avoid storage conflict when dealing with upgradeable contracts.
 * This library helps with reading and writing to such slots without the need for inline assembly.
 *
 * The functions in this library return Slot structs that contain a `value` member that can be used to read or write.
 *
 * Example usage to set ERC-1967 implementation slot:
 * ```solidity
 * contract ERC1967 {
 *     // Define the slot. Alternatively, use the SlotDerivation library to derive the slot.
 *     bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
 *
 *     function _getImplementation() internal view returns (address) {
 *         return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
 *     }
 *
 *     function _setImplementation(address newImplementation) internal {
 *         require(newImplementation.code.length > 0);
 *         StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
 *     }
 * }
 * ```
 *
 * TIP: Consider using this library along with {SlotDerivation}.
 */
library StorageSlot {
    struct AddressSlot {
        address value;
    }

    struct BooleanSlot {
        bool value;
    }

    struct Bytes32Slot {
        bytes32 value;
    }

    struct Uint256Slot {
        uint256 value;
    }

    struct Int256Slot {
        int256 value;
    }

    struct StringSlot {
        string value;
    }

    struct BytesSlot {
        bytes value;
    }

    /**
     * @dev Returns an `AddressSlot` with member `value` located at `slot`.
     */
    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `BooleanSlot` with member `value` located at `slot`.
     */
    function getBooleanSlot(bytes32 slot) internal pure returns (BooleanSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Bytes32Slot` with member `value` located at `slot`.
     */
    function getBytes32Slot(bytes32 slot) internal pure returns (Bytes32Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Uint256Slot` with member `value` located at `slot`.
     */
    function getUint256Slot(bytes32 slot) internal pure returns (Uint256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `Int256Slot` with member `value` located at `slot`.
     */
    function getInt256Slot(bytes32 slot) internal pure returns (Int256Slot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns a `StringSlot` with member `value` located at `slot`.
     */
    function getStringSlot(bytes32 slot) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `StringSlot` representation of the string storage pointer `store`.
     */
    function getStringSlot(string storage store) internal pure returns (StringSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }

    /**
     * @dev Returns a `BytesSlot` with member `value` located at `slot`.
     */
    function getBytesSlot(bytes32 slot) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := slot
        }
    }

    /**
     * @dev Returns an `BytesSlot` representation of the bytes storage pointer `store`.
     */
    function getBytesSlot(bytes storage store) internal pure returns (BytesSlot storage r) {
        assembly ("memory-safe") {
            r.slot := store.slot
        }
    }
}


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.6.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.5.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 *
 * IMPORTANT: Deprecated. This storage-based reentrancy guard will be removed and replaced
 * by the {ReentrancyGuardTransient} variant in v6.0.
 *
 * @custom:stateless
 */
abstract contract ReentrancyGuard {
    using StorageSlot for bytes32;

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ReentrancyGuard")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REENTRANCY_GUARD_STORAGE =
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    /**
     * @dev A `view` only version of {nonReentrant}. Use to block view functions
     * from being called, preventing reading from inconsistent contract state.
     *
     * CAUTION: This is a "view" modifier and does not change the reentrancy
     * status. Use it only on view functions. For payable or non-payable functions,
     * use the standard {nonReentrant} modifier instead.
     */
    modifier nonReentrantView() {
        _nonReentrantBeforeView();
        _;
    }

    function _nonReentrantBeforeView() private view {
        if (_reentrancyGuardEntered()) {
            revert ReentrancyGuardReentrantCall();
        }
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        _nonReentrantBeforeView();

        // Any calls to nonReentrant after this point will fail
        _reentrancyGuardStorageSlot().getUint256Slot().value = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyGuardStorageSlot().getUint256Slot().value = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _reentrancyGuardStorageSlot().getUint256Slot().value == ENTERED;
    }

    function _reentrancyGuardStorageSlot() internal pure virtual returns (bytes32) {
        return REENTRANCY_GUARD_STORAGE;
    }
}


// File contracts/RangeZone.sol

// Original license: SPDX_License_Identifier: MIT
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

    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
        owner = msg.sender;
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
        require(block.timestamp - updatedAt <= 24 hours, "Price too old");

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
        require(block.timestamp - updatedAt <= 24 hours, "Price too old");

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
