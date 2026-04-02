RangeZone is a decentralised prediction market on Rootstock Network that allows people trade on the movement of BTC within a time frame.


**Scope of my Capstone Project**
**Project Name:** RangeZone

RangeZone is a time-based on-chain primitive built on Rootstock that resolves a BTC price magnitude market at a fixed expiry time.

**How it is expected to behave**

The contract moves through four states. In the Open state users stake yes or no with rBTC into any of the open market i.e:

-  Will BTC be up by 2% by 5pm UTC? 
- Will BTC reach a new ATH by end of 2026?
- Will BTC go below 50k by December 31st 2026? etc 

When the expiry time passes, the contract moves to Closed and no more stakes are accepted. The admin will trigger the resolution, or it can be automated, after which it reads the Chainlink BTC/USD price feed, computes the percentage movement from start price to end price, and moves the contract to Resolved.  So claim button is available if users predict correctly

**The build**

One Solidity contract with five functions: createMarket, stake, resolve, claim, withdrawFee and getMarketInfo. Chainlink price feed integration for start and end price snapshot. State transition logic enforcing what is allowed at each stage. Basic Hardhat tests covering the full state flow. Deployment script targeting RSK testnet.

**What is out of scope**

Multiple concurrent markets, a factory pattern, a full blown frontend, admin controls, and support for assets other than BTC.

**Goal**

A minimal, working smart contract that demonstrates a clean time-driven state machine resolving a time-based prediction on RSK testnet.