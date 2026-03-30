# The Graph Subgraph Setup Guide

## Overview

This guide explains how to set up and deploy a subgraph for RangeZone on RSK Testnet using The Graph Protocol. The subgraph indexes `Staked` and `Claimed` events from your smart contract, enabling efficient querying of transaction history and leaderboard data.

## Why Subgraph?

- **Problem**: RSK Testnet public RPC doesn't support `eth_getLogs` (required for event filtering)
- **Solution**: The Graph indexes blockchain events off-chain, providing a GraphQL API for efficient queries
- **Benefits**:
  - Real-time data indexed from contract events
  - Aggregated statistics (top stakers, user history)
  - Better performance than on-chain queries
  - Automatic data synchronization

## Prerequisites

1. **The Graph Studio Account**: https://thegraph.com/studio
2. **Subgraph CLI**: `npm install -g @graphprotocol/graph-cli`
3. **Contract Deployment**: Your RangeZone contract deployed on RSK Testnet
4. **Contract Address & ABI**: Save the contract details

## Step 1: Create Subgraph Directory

```bash
mkdir subgraph
cd subgraph
graph init --studio rangezone
```

## Step 2: Configure Subgraph Manifest (`subgraph.yaml`)

Update your `subgraph.yaml`:

```yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: RangeZone
    network: rsk-testnet
    source:
      address: "YOUR_CONTRACT_ADDRESS"
      abi: RangeZone
      startBlock: YOUR_START_BLOCK
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - Staked
        - Claimed
        - Market
      eventHandlers:
        - event: Staked(indexed uint256,indexed address,uint8,uint256)
          handler: handleStaked
        - event: Claimed(indexed uint256,indexed address,uint256)
          handler: handleClaimed
        - event: MarketCreated(indexed uint256,int256,uint256,uint256,uint256)
          handler: handleMarketCreated
      file: ./src/mapping.ts
```

## Step 3: Define GraphQL Schema (`schema.graphql`)

```graphql
type Staked @entity(immutable: true) {
  id: Bytes!
  marketId: BigInt!
  user: Bytes!
  bracket: Int!
  amount: BigInt!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}

type Claimed @entity(immutable: true) {
  id: Bytes!
  marketId: BigInt!
  user: Bytes!
  amount: BigInt!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}

type Market @entity {
  id: Bytes!
  marketId: BigInt!
  startPrice: BigInt!
  expiry: BigInt!
  threshold1: BigInt!
  threshold2: BigInt!
  blockTimestamp: BigInt!
}
```

## Step 4: Write Mapping Functions (`src/mapping.ts`)

```typescript
import { Staked, Claimed, MarketCreated } from "../generated/RangeZone/RangeZone"
import { Staked as StakedEntity, Claimed as ClaimedEntity, Market } from "../generated/schema"
import { BigInt, Bytes } from "@graphprotocol/graph-ts"

export function handleStaked(event: Staked): void {
  let entity = new StakedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.marketId = event.params.marketId
  entity.user = event.params.user
  entity.bracket = event.params.bracket
  entity.amount = event.params.amount
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleClaimed(event: Claimed): void {
  let entity = new ClaimedEntity(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.marketId = event.params.marketId
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleMarketCreated(event: MarketCreated): void {
  let entity = new Market(event.params.marketId.toString())
  entity.marketId = event.params.marketId
  entity.startPrice = event.params.startPrice
  entity.expiry = event.params.expiry
  entity.threshold1 = event.params.threshold1
  entity.threshold2 = event.params.threshold2
  entity.blockTimestamp = event.block.timestamp
  entity.save()
}
```

## Step 5: Deploy Subgraph

```bash
# Build subgraph
graph codegen
graph build

# Deploy to The Graph Studio
graph deploy --studio rangezone
```

## Step 6: Configure Frontend

1. Get your deployed subgraph URL from The Graph Studio
2. Set environment variable in `.env.local`:

```bash
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID
```

## Available Hooks

The frontend provides these hooks for querying subgraph data:

### User Transactions
```typescript
import { useUserTransactionHistory } from "@/hooks/useSubgraph"

const { transactions, loading, stakes, claims } = useUserTransactionHistory(userAddress)
```

### Leaderboard
```typescript
import { useLeaderboardFromSubgraph } from "@/hooks/useSubgraph"

const { leaderboard, loading, error } = useLeaderboardFromSubgraph()
```

### Individual Stakes
```typescript
import { useUserStakesFromSubgraph } from "@/hooks/useSubgraph"

const { stakes, loading, error } = useUserStakesFromSubgraph(userAddress)
```

### Individual Claims
```typescript
import { useUserClaimsFromSubgraph } from "@/hooks/useSubgraph"

const { claims, loading, error } = useUserClaimsFromSubgraph(userAddress)
```

## Fallback Behavior

If the subgraph is not available:
- The frontend automatically uses dummy data for UI demonstration
- Once subgraph is deployed and configured, real data replaces dummy data
- No code changes required!

## Testing Queries

Test your subgraph using The Graph Studio's built-in explorer:

```graphql
query {
  stakeds(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
    user
    amount
    marketId
    bracket
    blockTimestamp
    transactionHash
  }
  claimeds(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
    user
    amount
    marketId
    blockTimestamp
  }
}
```

## Troubleshooting

### Subgraph not syncing?
- Check that contract address is correct
- Verify `startBlock` matches deployment block
- Ensure event signatures match contract ABI

### No data showing?
- Subgraph takes time to sync (check progress in Studio)
- Ensure transactions exist on the testnet
- Check `NEXT_PUBLIC_SUBGRAPH_URL` environment variable

### Schema errors?
- Run `graph codegen` to regenerate types
- Check GraphQL schema syntax
- Verify entity names match mapping.ts

## Resources

- [The Graph Documentation](https://thegraph.com/docs/)
- [Graph CLI Reference](https://github.com/graphprotocol/graph-cli)
- [RSK Testnet Info](https://testnet.rsk.co/)
- [RangeZone Contract ABI](./contract/artifacts/contracts/RangeZone.sol/RangeZone.json)

## Next Steps

1. Deploy your subgraph to The Graph Studio
2. Update `NEXT_PUBLIC_SUBGRAPH_URL` in frontend `.env.local`
3. Create test transactions on RSK Testnet
4. View real data in sidebar, leaderboard, and transaction history!
