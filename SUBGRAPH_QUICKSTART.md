# Subgraph Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Install Graph CLI
```bash
npm install -g @graphprotocol/graph-cli
```

### 2. Create Subgraph Project
```bash
cd PlayZone
graph init --studio rangezone
```

### 3. Key Files to Update
- `subgraph.yaml` - Network, contract address, event handlers
- `schema.graphql` - Entity definitions (Staked, Claimed, Market)
- `src/mapping.ts` - Event handler logic

### 4. Get Contract Info
```bash
# From your deployment
CONTRACT_ADDRESS=0x...       # RSK Testnet contract address
START_BLOCK=123456          # Block number where contract deployed
```

### 5. Deploy
```bash
graph codegen
graph build
graph deploy --studio rangezone
```

### 6. Set Environment Variable
```bash
# In frontend/.env.local
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID
```

## 📋 Minimal Schema (schema.graphql)

```graphql
type Staked @entity(immutable: true) {
  id: Bytes!
  marketId: BigInt!
  user: Bytes!
  bracket: Int!
  amount: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}

type Claimed @entity(immutable: true) {
  id: Bytes!
  marketId: BigInt!
  user: Bytes!
  amount: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
}
```

## 🔗 Minimal Event Mapping (src/mapping.ts)

```typescript
import { Staked, Claimed } from "../generated/RangeZone/RangeZone"
import { Staked as StakedEntity, Claimed as ClaimedEntity } from "../generated/schema"

export function handleStaked(event: Staked): void {
  let entity = new StakedEntity(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity.marketId = event.params.marketId
  entity.user = event.params.user
  entity.bracket = event.params.bracket
  entity.amount = event.params.amount
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleClaimed(event: Claimed): void {
  let entity = new ClaimedEntity(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity.marketId = event.params.marketId
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}
```

## 🔍 Test Query (in Graph Studio)

```graphql
query {
  stakeds(first: 5, orderBy: blockTimestamp, orderDirection: desc) {
    id
    user
    amount
    marketId
    bracket
    blockTimestamp
  }
}
```

## 📱 Frontend Usage

```typescript
// Get user transactions (stakes + claims combined)
import { useUserTransactionHistory } from '@/hooks/useSubgraph'

function MyComponent() {
  const { transactions, loading } = useUserTransactionHistory('0x...')

  if (loading) return <div>Loading...</div>
  return transactions.map(tx => (
    <div key={tx.txHash}>
      {tx.type === 'stake' ? 'Staked' : 'Claimed'} {tx.amount}
    </div>
  ))
}
```

## ✅ Deployment Checklist

- [ ] Graph CLI installed
- [ ] Subgraph initialized
- [ ] schema.graphql created with Staked and Claimed entities
- [ ] mapping.ts updated with handlers
- [ ] subgraph.yaml configured with contract address and start block
- [ ] Graph codegen run successfully
- [ ] Graph build successful
- [ ] Deployed to The Graph Studio
- [ ] Subgraph syncing (check progress in Studio)
- [ ] `NEXT_PUBLIC_SUBGRAPH_URL` set in frontend .env.local
- [ ] Test query returns data

## 🆘 Common Issues

**Subgraph not syncing?**
→ Check contract address and start block in `subgraph.yaml`

**"Undefined reference" error?**
→ Run `graph codegen` to regenerate types

**No data after 10 minutes?**
→ Check that test transactions exist on RSK Testnet
→ Verify subgraph is syncing in Graph Studio dashboard

**Query returns empty?**
→ Use abis.json for contract ABI
→ Verify event signatures match contract

## 📚 Full Documentation

See `/PlayZone/SUBGRAPH_SETUP.md` for complete guide with:
- Detailed step-by-step instructions
- Network configuration
- Advanced features
- Troubleshooting section
- Resource links
