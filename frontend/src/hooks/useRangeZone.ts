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

export function useMarketById(marketId: bigint | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "getMarket",
    args: marketId !== undefined ? [marketId] : undefined,
    chainId: RSK_TESTNET_CHAIN_ID,
    query: { enabled: marketId !== undefined && marketId > 0n },
  });

  const market = data
    ? {
        startPrice: (data as any).startPrice ?? (data as any)[0],
        endPrice: (data as any).endPrice ?? (data as any)[1],
        expiry: (data as any).expiry ?? (data as any)[2],
        totalPool: (data as any).totalPool ?? (data as any)[3],
        winningBracket: Number((data as any).winningBracket ?? (data as any)[4]),
        state: Number((data as any).state ?? (data as any)[5]),
        threshold1: (data as any).threshold1 ?? (data as any)[6],
        threshold2: (data as any).threshold2 ?? (data as any)[7],
      }
    : undefined;

  return { market, isLoading, refetch };
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

    return { id: BigInt(i + 1), market, bracketTotals: [b0, b1, b2] as [bigint, bigint, bigint] };
  }).reverse();

  return { entries, isLoading };
}

export interface StakePoint {
  index: number;
  b0: number;
  b1: number;
  b2: number;
  u0: number;
  u1: number;
  u2: number;
  label: string;
}

export function useStakedEvents(marketId: bigint | undefined, userAddress?: string) {
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

        let b0 = 0, b1 = 0, b2 = 0;
        let u0 = 0, u1 = 0, u2 = 0;
        const normalizedUser = userAddress?.toLowerCase();

        const pts: StakePoint[] = logs.map((log, i) => {
          const amt = Number(log.args.amount ?? 0n) / 1e18;
          const bracket = Number(log.args.bracket ?? 0);
          const isUser = normalizedUser && (log.args.user as string)?.toLowerCase() === normalizedUser;

          if (bracket === 0) { b0 += amt; if (isUser) u0 += amt; }
          else if (bracket === 1) { b1 += amt; if (isUser) u1 += amt; }
          else { b2 += amt; if (isUser) u2 += amt; }

          return {
            index: i + 1,
            b0: Number(b0.toFixed(6)),
            b1: Number(b1.toFixed(6)),
            b2: Number(b2.toFixed(6)),
            u0: Number(u0.toFixed(6)),
            u1: Number(u1.toFixed(6)),
            u2: Number(u2.toFixed(6)),
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
  }, [marketId, userAddress, client]);

  return { points, isLoading };
}

export function useUserStakedMarkets(userAddress: `0x${string}` | undefined) {
  const [marketIds, setMarketIds] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const client = usePublicClient({ chainId: RSK_TESTNET_CHAIN_ID });

  useEffect(() => {
    if (!userAddress || !client) return;

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const logs = await client.getLogs({
          address: RANGE_ZONE_ADDRESS,
          event: parseAbiItem(
            "event Staked(uint256 indexed marketId, address indexed user, uint8 bracket, uint256 amount)"
          ),
          args: { user: userAddress },
          fromBlock: 0n,
          toBlock: "latest",
        });

        if (cancelled) return;

        const seen = new Set<string>();
        const ids: bigint[] = [];
        for (const log of logs) {
          const id = log.args.marketId as bigint;
          const key = id.toString();
          if (!seen.has(key)) {
            seen.add(key);
            ids.push(id);
          }
        }
        ids.sort((a, b) => (a > b ? -1 : 1));
        setMarketIds(ids);
      } catch (e) {
        console.error("useUserStakedMarkets error:", e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userAddress, client]);

  return { marketIds, isLoading };
}

export interface UserTransaction {
  type: "stake" | "claim";
  marketId: bigint;
  bracket?: number;
  amount: bigint;
  blockNumber: bigint;
  txHash: `0x${string}`;
}

async function fetchLogsWithFallback(
  client: ReturnType<typeof usePublicClient>,
  params: Parameters<NonNullable<ReturnType<typeof usePublicClient>>["getLogs"]>[0]
) {
  if (!client) return [];
  try {
    return await client.getLogs({ ...params, fromBlock: 0n, toBlock: "latest" } as any);
  } catch (e: any) {
    const msg = e?.message ?? "";

    // Check if method doesn't exist (RSK doesn't support eth_getLogs)
    const isMethodNotSupported = msg.includes("does not exist") || msg.includes("is not available");
    if (isMethodNotSupported) {
      console.warn("getLogs method not supported by RPC provider, returning empty results");
      return [];
    }

    // Check for block range errors
    const isRangeError =
      msg.includes("block range") ||
      msg.includes("too large") ||
      msg.includes("limit") ||
      msg.includes("10000") ||
      msg.includes("1000");
    if (!isRangeError) throw e;
    // Fallback: fetch recent 500,000 blocks only
    try {
      const latest = await client.getBlockNumber();
      const from = latest > 500000n ? latest - 500000n : 0n;
      return await client.getLogs({ ...params, fromBlock: from, toBlock: "latest" } as any);
    } catch {
      return [];
    }
  }
}

export function useUserTransactions(userAddress: `0x${string}` | undefined) {
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = usePublicClient({ chainId: RSK_TESTNET_CHAIN_ID });

  useEffect(() => {
    if (!userAddress || !client) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const stakeEvent = parseAbiItem(
          "event Staked(uint256 indexed marketId, address indexed user, uint8 bracket, uint256 amount)"
        );
        const claimEvent = parseAbiItem(
          "event Claimed(uint256 indexed marketId, address indexed user, uint256 amount)"
        );

        const [stakeLogs, claimLogs] = await Promise.all([
          fetchLogsWithFallback(client, {
            address: RANGE_ZONE_ADDRESS,
            event: stakeEvent,
            args: { user: userAddress },
          }),
          fetchLogsWithFallback(client, {
            address: RANGE_ZONE_ADDRESS,
            event: claimEvent,
            args: { user: userAddress },
          }),
        ]);

        if (cancelled) return;

        const txs: UserTransaction[] = [
          ...stakeLogs.map((l: any) => ({
            type: "stake" as const,
            marketId: l.args.marketId as bigint,
            bracket: Number(l.args.bracket ?? 0),
            amount: l.args.amount as bigint,
            blockNumber: l.blockNumber ?? 0n,
            txHash: l.transactionHash as `0x${string}`,
          })),
          ...claimLogs.map((l: any) => ({
            type: "claim" as const,
            marketId: l.args.marketId as bigint,
            amount: l.args.amount as bigint,
            blockNumber: l.blockNumber ?? 0n,
            txHash: l.transactionHash as `0x${string}`,
          })),
        ];

        txs.sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : 1));
        setTransactions(txs);
      } catch (e: any) {
        console.error("useUserTransactions error:", e);
        setError(e?.message ?? "Failed to load transactions");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userAddress, client]);

  return { transactions, isLoading, error };
}

// RSK Testnet does not support EIP-1559 — use legacy gas pricing.
// Minimum gas price on RSK Testnet is 0.06 gwei (60_000_000 wei).
const RSK_GAS_PRICE = 65_000_000n; // 0.065 gwei — safe above the minimum

export function useStake() {
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });

  const stake = (marketId: bigint, bracket: number, amountEth: string) => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "stake",
      args: [marketId, bracket as 0 | 1 | 2],
      value: parseEther(amountEth),
      chainId: RSK_TESTNET_CHAIN_ID,
      gasPrice: RSK_GAS_PRICE,
    });
  };

  return { stake, hash, isPending, isConfirming, isSuccess, error: receiptError || writeError };
}

export function useResolve() {
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });

  const resolve = (marketId: bigint) => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "resolve",
      args: [marketId],
      chainId: RSK_TESTNET_CHAIN_ID,
      gasPrice: RSK_GAS_PRICE,
    });
  };

  return { resolve, hash, isPending, isConfirming, isSuccess, error: receiptError || writeError };
}

export function useClaim() {
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });

  const claim = (marketId: bigint) => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "claim",
      args: [marketId],
      chainId: RSK_TESTNET_CHAIN_ID,
      gasPrice: RSK_GAS_PRICE,
    });
  };

  return { claim, hash, isPending, isConfirming, isSuccess, error: receiptError || writeError };
}

export function useCreateMarket() {
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });

  const createMarket = (durationSeconds: number, threshold1: number, threshold2: number) => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "createMarket",
      args: [BigInt(durationSeconds), BigInt(threshold1), BigInt(threshold2)],
      chainId: RSK_TESTNET_CHAIN_ID,
      gasPrice: RSK_GAS_PRICE,
    });
  };

  return { createMarket, hash, isPending, isConfirming, isSuccess, error: receiptError || writeError };
}

export function useWithdrawFee() {
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash });

  const withdrawFee = () => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "withdrawFee",
      chainId: RSK_TESTNET_CHAIN_ID,
      gasPrice: RSK_GAS_PRICE,
    });
  };

  return { withdrawFee, hash, isPending, isConfirming, isSuccess, error: receiptError || writeError };
}
