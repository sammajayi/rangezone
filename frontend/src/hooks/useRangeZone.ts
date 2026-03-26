"use client";

import { useState, useEffect } from "react";
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseEther, parseAbiItem } from "viem";
import { RANGE_ZONE_ADDRESS, RANGE_ZONE_ABI } from "../lib/rangeZoneContract";

const RSK_TESTNET_CHAIN_ID = 31;

export function useCurrentMarket() {
  return useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "getCurrentMarket",
    chainId: RSK_TESTNET_CHAIN_ID,
  });
}

export function useMarketCount() {
  return useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "marketCount",
    chainId: RSK_TESTNET_CHAIN_ID,
  });
}

export function useContractOwner() {
  return useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "owner",
    chainId: RSK_TESTNET_CHAIN_ID,
  });
}

export function useAccumulatedFee() {
  return useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "accumulatedFee",
    chainId: RSK_TESTNET_CHAIN_ID,
  });
}

export function useBracketTotals(marketId: bigint | undefined) {
  const b0 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "bracketTotals",
    args: marketId !== undefined ? [marketId, 0] : undefined,
    chainId: RSK_TESTNET_CHAIN_ID,
    query: { enabled: marketId !== undefined && marketId > 0n },
  });
  const b1 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "bracketTotals",
    args: marketId !== undefined ? [marketId, 1] : undefined,
    chainId: RSK_TESTNET_CHAIN_ID,
    query: { enabled: marketId !== undefined && marketId > 0n },
  });
  const b2 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "bracketTotals",
    args: marketId !== undefined ? [marketId, 2] : undefined,
    chainId: RSK_TESTNET_CHAIN_ID,
    query: { enabled: marketId !== undefined && marketId > 0n },
  });
  return [b0.data ?? 0n, b1.data ?? 0n, b2.data ?? 0n] as [bigint, bigint, bigint];
}

export function useUserStakes(marketId: bigint | undefined, userAddress: `0x${string}` | undefined) {
  const s0 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "stakes",
    args: marketId !== undefined && userAddress ? [marketId, 0, userAddress] : undefined,
    chainId: RSK_TESTNET_CHAIN_ID,
    query: { enabled: marketId !== undefined && marketId > 0n && !!userAddress },
  });
  const s1 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "stakes",
    args: marketId !== undefined && userAddress ? [marketId, 1, userAddress] : undefined,
    chainId: RSK_TESTNET_CHAIN_ID,
    query: { enabled: marketId !== undefined && marketId > 0n && !!userAddress },
  });
  const s2 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "stakes",
    args: marketId !== undefined && userAddress ? [marketId, 2, userAddress] : undefined,
    chainId: RSK_TESTNET_CHAIN_ID,
    query: { enabled: marketId !== undefined && marketId > 0n && !!userAddress },
  });
  return [s0.data ?? 0n, s1.data ?? 0n, s2.data ?? 0n] as [bigint, bigint, bigint];
}

export interface MarketEntry {
  id: bigint;
  market: {
    startPrice: bigint;
    endPrice: bigint;
    expiry: bigint;
    totalPool: bigint;
    winningBracket: number;
    state: number;
    threshold1: bigint;
    threshold2: bigint;
  } | undefined;
  bracketTotals: [bigint, bigint, bigint];
}

export function useAllMarkets(): { entries: MarketEntry[]; isLoading: boolean } {
  const { data: marketCount, isLoading: countLoading } = useMarketCount();
  const count = Number(marketCount ?? 0n);

  const marketCalls = Array.from({ length: count }, (_, i) => ({
    address: RANGE_ZONE_ADDRESS as `0x${string}`,
    abi: RANGE_ZONE_ABI,
    functionName: "getMarket" as const,
    args: [BigInt(i + 1)] as [bigint],
    chainId: RSK_TESTNET_CHAIN_ID,
  }));

  const bracketCalls = Array.from({ length: count * 3 }, (_, i) => ({
    address: RANGE_ZONE_ADDRESS as `0x${string}`,
    abi: RANGE_ZONE_ABI,
    functionName: "bracketTotals" as const,
    args: [BigInt(Math.floor(i / 3) + 1), i % 3] as [bigint, number],
    chainId: RSK_TESTNET_CHAIN_ID,
  }));

  const { data: results, isLoading: resultsLoading } = useReadContracts({
    contracts: [...marketCalls, ...bracketCalls] as any,
    query: { enabled: count > 0 },
  });

  const isLoading = countLoading || (count > 0 && resultsLoading);

  if (!results || count === 0) {
    return { entries: [], isLoading };
  }

  const entries: MarketEntry[] = Array.from({ length: count }, (_, i) => {
    const raw = results[i]?.result as any;
    const market = raw
      ? {
          startPrice: raw.startPrice ?? raw[0],
          endPrice: raw.endPrice ?? raw[1],
          expiry: raw.expiry ?? raw[2],
          totalPool: raw.totalPool ?? raw[3],
          winningBracket: Number(raw.winningBracket ?? raw[4]),
          state: Number(raw.state ?? raw[5]),
          threshold1: raw.threshold1 ?? raw[6],
          threshold2: raw.threshold2 ?? raw[7],
        }
      : undefined;

    const b0 = (results[count + i * 3]?.result as bigint | undefined) ?? 0n;
    const b1 = (results[count + i * 3 + 1]?.result as bigint | undefined) ?? 0n;
    const b2 = (results[count + i * 3 + 2]?.result as bigint | undefined) ?? 0n;

    return { id: BigInt(i + 1), market, bracketTotals: [b0, b1, b2] };
  }).reverse();

  return { entries, isLoading };
}

export interface StakePoint {
  index: number;
  b0: number;
  b1: number;
  b2: number;
  label: string;
}

export function useStakedEvents(marketId: bigint | undefined) {
  const [points, setPoints] = useState<StakePoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const client = usePublicClient({ chainId: RSK_TESTNET_CHAIN_ID });

  useEffect(() => {
    if (!marketId || marketId === 0n || !client) return;

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const logs = await client.getLogs({
          address: RANGE_ZONE_ADDRESS,
          event: parseAbiItem(
            "event Staked(uint256 indexed marketId, address indexed user, uint8 bracket, uint256 amount)"
          ),
          args: { marketId },
          fromBlock: 0n,
          toBlock: "latest",
        });

        if (cancelled) return;

        let b0 = 0;
        let b1 = 0;
        let b2 = 0;

        const pts: StakePoint[] = logs.map((log, i) => {
          const amt = Number(log.args.amount ?? 0n) / 1e18;
          const bracket = Number(log.args.bracket ?? 0);
          if (bracket === 0) b0 += amt;
          else if (bracket === 1) b1 += amt;
          else b2 += amt;

          return {
            index: i + 1,
            b0: Number(b0.toFixed(6)),
            b1: Number(b1.toFixed(6)),
            b2: Number(b2.toFixed(6)),
            label: `#${i + 1}`,
          };
        });

        setPoints(pts);
      } catch (e) {
        console.error("useStakedEvents error:", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [marketId, client]);

  return { points, isLoading };
}

export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = (marketId: bigint, bracket: number, amountEth: string) => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "stake",
      args: [marketId, bracket as 0 | 1 | 2],
      value: parseEther(amountEth),
    });
  };

  return { stake, hash, isPending, isConfirming, isSuccess, error };
}

export function useResolve() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const resolve = (marketId: bigint) => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "resolve",
      args: [marketId],
    });
  };

  return { resolve, hash, isPending, isConfirming, isSuccess, error };
}

export function useClaim() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = (marketId: bigint) => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "claim",
      args: [marketId],
    });
  };

  return { claim, hash, isPending, isConfirming, isSuccess, error };
}

export function useCreateMarket() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createMarket = (durationSeconds: number, threshold1: number, threshold2: number) => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "createMarket",
      args: [BigInt(durationSeconds), BigInt(threshold1), BigInt(threshold2)],
    });
  };

  return { createMarket, hash, isPending, isConfirming, isSuccess, error };
}

export function useWithdrawFee() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdrawFee = () => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "withdrawFee",
    });
  };

  return { withdrawFee, hash, isPending, isConfirming, isSuccess, error };
}
