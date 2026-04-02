
# RangeZone

RangeZone is a time-based prediction market primitive built on the Rootstock blockchain. It allows users to stake RBTC on the magnitude of BTC price movement over a fixed time window. Instead of predicting direction, users predict how much the price will move.

---

## What It Does

When a market is created, the current BTC price is snapshotted as the start price and a duration is set. Users stake RBTC into one of three magnitude brackets before the market expires. When the time window closes, anyone can trigger resolution which reads the end price from an oracle, computes the percentage movement, and determines the winning bracket. Winners claim a proportional share of the total pool minus a 5% protocol fee.

---

## Rules

**Staking**
- Users can only stake while the market is in the Open state
- Staking is not allowed after the expiry time has passed
- A valid bracket must be selected: 0, 1, or 2
- A non-zero RBTC value must be sent with the stake

**Brackets**
*i.e an open market trade is between 3% to 7%*
- Bracket 0 — price moves less than 3%
- Bracket 1 — price moves between 3% and 7%
- Bracket 2 — price moves 7% or more
- Movement is absolute, meaning it does not matter if the price went up or down, only the magnitude counts

**Resolution**
- Anyone can call resolve once the expiry time has passed
- Resolution reads the end price from the oracle and computes the percentage change from the start price
- The contract moves to the Resolved state permanently after resolution

**Claiming**
- Only users who staked in the winning bracket can claim
- Payout is proportional to the user's stake relative to the total staked in the winning bracket
- A user's stake is set to zero before the payout is sent to prevent double claiming

**Protocol Fee**
- A 5% fee is deducted from the total pool at resolution
- The fee is tracked in a separate variable so unclaimed winnings are never at risk
- Only the contract owner can withdraw the accumulated fee

---

## Design Choices

**State machine architecture**

The contract is built as an explicit state machine with three states: Open, Closed, and Resolved. Every function checks the current state before executing. This makes the contract predictable and easy to reason about. It is impossible to stake in a resolved market or claim in an open one.

**Absolute magnitude, not direction**

Most prediction markets ask users to pick a direction. RangeZone asks users to predict volatility. This creates a more expressive market where traders with strong convictions about how much a price will move have a clean instrument to express that view on chain.

**Proportional payout**

Winners share the entire pool proportionally rather than receiving a fixed odds payout. This means the more RBTC staked in losing brackets, the higher the reward for winners. It also means the contract never needs external liquidity to settle.

**Separate fee tracking**

The protocol fee is calculated and stored in a dedicated variable at the time of resolution rather than being calculated at withdrawal. This ensures the owner can only ever withdraw the fee portion and cannot accidentally drain unclaimed winner payouts.

**Mock oracle for testnet**

Chainlink does not support Rootstock. APRO Oracle supports Rootstock mainnet but has no BTC/USD feed on testnet. A MockPriceFeed contract is used for testnet deployment to demonstrate the full state machine end to end. For production, the contract points to APRO's rBTC/USD feed on Rootstock mainnet at `0xd1dd9396946F45b5C03A247DB1703798a365eAe3`.

**Flexible market duration**

The market duration is passed as a parameter in seconds rather than being hardcoded. This allows the frontend to create markets of any length, from one hour to several days, without requiring contract changes.

---

--
### Deployed Contract

#### Old Contract

MockPriceFeed: 0xD97Fd22fbAd4851759bA933811a66b9a9C385dA1
RangeZone: 0x73689f97092c0b27DDd90cd59b14Ca691dE754D7

#### New Contract
RangeZone: 0x3dcDc6FbE53dD8c55F53EA0653f22787E9FFCe36
MockPrice: 0xD2b7A578BAe996E2bB040B827cE9C26e4EC34342
--

---
## Contract Functions

| Function | Description |
|---|---|
| `createMarket(duration)` | Opens a new market with a start price snapshot and expiry time |
| `stake(bracket)` | Stakes RBTC into a chosen magnitude bracket |
| `resolve()` | Reads end price and determines the winning bracket after expiry |
| `claim()` | Withdraws proportional payout for winners |
| `withdrawFee()` | Allows the owner to withdraw accumulated protocol fees |
| `getMarketInfo()` | Returns the full current market state |

---

## Running Tests

```bash
npx hardhat test
```

---

## Deployment

```bash
npx hardhat run scripts/deploy.ts --network rskTestnet
```





g