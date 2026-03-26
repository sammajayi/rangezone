"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { RANGE_ZONE_ADDRESS, RANGE_ZONE_ABI } from "../src/lib/rangeZoneContract";

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
