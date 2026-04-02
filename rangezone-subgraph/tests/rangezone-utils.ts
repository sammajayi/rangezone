import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Claimed,
  MarketCreated,
  Resolved,
  Staked
} from "../generated/Rangezone/Rangezone"

export function createClaimedEvent(
  marketId: BigInt,
  user: Address,
  amount: BigInt
): Claimed {
  let claimedEvent = changetype<Claimed>(newMockEvent())

  claimedEvent.parameters = new Array()

  claimedEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  claimedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  claimedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return claimedEvent
}

export function createMarketCreatedEvent(
  marketId: BigInt,
  startPrice: BigInt,
  expiry: BigInt,
  threshold1: BigInt,
  threshold2: BigInt
): MarketCreated {
  let marketCreatedEvent = changetype<MarketCreated>(newMockEvent())

  marketCreatedEvent.parameters = new Array()

  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startPrice",
      ethereum.Value.fromSignedBigInt(startPrice)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam("expiry", ethereum.Value.fromUnsignedBigInt(expiry))
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "threshold1",
      ethereum.Value.fromUnsignedBigInt(threshold1)
    )
  )
  marketCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "threshold2",
      ethereum.Value.fromUnsignedBigInt(threshold2)
    )
  )

  return marketCreatedEvent
}

export function createResolvedEvent(
  marketId: BigInt,
  winningBracket: i32,
  endPrice: BigInt
): Resolved {
  let resolvedEvent = changetype<Resolved>(newMockEvent())

  resolvedEvent.parameters = new Array()

  resolvedEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  resolvedEvent.parameters.push(
    new ethereum.EventParam(
      "winningBracket",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(winningBracket))
    )
  )
  resolvedEvent.parameters.push(
    new ethereum.EventParam(
      "endPrice",
      ethereum.Value.fromSignedBigInt(endPrice)
    )
  )

  return resolvedEvent
}

export function createStakedEvent(
  marketId: BigInt,
  user: Address,
  bracket: i32,
  amount: BigInt
): Staked {
  let stakedEvent = changetype<Staked>(newMockEvent())

  stakedEvent.parameters = new Array()

  stakedEvent.parameters.push(
    new ethereum.EventParam(
      "marketId",
      ethereum.Value.fromUnsignedBigInt(marketId)
    )
  )
  stakedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  stakedEvent.parameters.push(
    new ethereum.EventParam(
      "bracket",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(bracket))
    )
  )
  stakedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return stakedEvent
}
