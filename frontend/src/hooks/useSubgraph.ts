"use client";

import { useQuery } from "@apollo/client/react";
import { client } from "../lib/subgraph/client";
import { GET_USER_STAKES, GET_USER_CLAIMS, GET_LEADERBOARD } from "../lib/subgraph/queries";
import { useState, useEffect } from "react";

export interface StakeEvent {
  id: string;
  marketId: string;
  user: string;
  bracket: number;
  amount: string;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
}

export interface ClaimEvent {
  id: string;
  marketId: string;
  user: string;
  amount: string;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
}

export interface UserTransaction {
  type: "stake" | "claim";
  marketId: string;
  bracket?: number;
  amount: string;
  blockNumber: number;
  blockTimestamp: number;
  txHash: string;
}

export interface LeaderboardUser {
  address: string;
  totalStaked: bigint;
  totalClaimed: bigint;
}

/**
 * Fetch user's stakes from subgraph
 */
export function useUserStakesFromSubgraph(userAddress?: string) {
  const { loading, error, data } = useQuery(GET_USER_STAKES, {
    client,
    variables: { user: userAddress?.toLowerCase() || "" },
    skip: !userAddress,
  });

  const stakes = (data?.stakeds || []) as StakeEvent[];

  return { stakes, loading, error };
}

/**
 * Fetch user's claims from subgraph
 */
export function useUserClaimsFromSubgraph(userAddress?: string) {
  const { loading, error, data } = useQuery(GET_USER_CLAIMS, {
    client,
    variables: { user: userAddress?.toLowerCase() || "" },
    skip: !userAddress,
  });

  const claims = (data?.claimeds || []) as ClaimEvent[];

  return { claims, loading, error };
}

/**
 * Combine stakes and claims into a single transaction history
 */
export function useUserTransactionHistory(userAddress?: string) {
  const { stakes, loading: stakesLoading } = useUserStakesFromSubgraph(userAddress);
  const { claims, loading: claimsLoading } = useUserClaimsFromSubgraph(userAddress);

  const transactions: UserTransaction[] = [
    ...stakes.map((stake) => ({
      type: "stake" as const,
      marketId: stake.marketId,
      bracket: stake.bracket,
      amount: stake.amount,
      blockNumber: stake.blockNumber,
      blockTimestamp: stake.blockTimestamp,
      txHash: stake.transactionHash,
    })),
    ...claims.map((claim) => ({
      type: "claim" as const,
      marketId: claim.marketId,
      amount: claim.amount,
      blockNumber: claim.blockNumber,
      blockTimestamp: claim.blockTimestamp,
      txHash: claim.transactionHash,
    })),
  ];

  // Sort by blockNumber descending (most recent first)
  transactions.sort((a, b) => b.blockNumber - a.blockNumber);

  return {
    transactions,
    loading: stakesLoading || claimsLoading,
    stakes,
    claims,
  };
}

/**
 * Fetch top stakers for leaderboard
 */
export function useLeaderboardFromSubgraph() {
  const { loading, error, data } = useQuery(GET_LEADERBOARD, { client });

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    if (data?.stakeds) {
      // Aggregate stakes by user
      const userMap = new Map<string, { staked: bigint; claimed: bigint }>();

      (data.stakeds as StakeEvent[]).forEach((stake) => {
        const user = stake.user.toLowerCase();
        const current = userMap.get(user) || { staked: 0n, claimed: 0n };
        userMap.set(user, {
          staked: current.staked + BigInt(stake.amount),
          claimed: current.claimed,
        });
      });

      // Convert to array and sort by total staked
      const sorted = Array.from(userMap.entries())
        .map(([address, stats]) => ({
          address,
          totalStaked: stats.staked,
          totalClaimed: stats.claimed,
        }))
        .sort((a, b) => (a.totalStaked > b.totalStaked ? -1 : 1))
        .slice(0, 10);

      setLeaderboard(sorted);
    }
  }, [data]);

  return { leaderboard, loading, error };
}
