"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { RANGE_ZONE_ADDRESS, RANGE_ZONE_ABI, MarketInfo } from "../lib/rangeZoneContract";

export function useMarketInfo() {
  return useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "getMarketInfo",
  });
}

export function useMarketCount() {
  return useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "marketCount",
  });
}

export function useContractOwner() {
  return useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "owner",
  });
}

export function useAccumulatedFee() {
  return useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "accumulatedFee",
  });
}

export function useBracketTotals(marketCount: bigint | undefined) {
  const b0 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "bracketTotals",
    args: marketCount !== undefined ? [marketCount, 0] : undefined,
    query: { enabled: marketCount !== undefined },
  });
  const b1 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "bracketTotals",
    args: marketCount !== undefined ? [marketCount, 1] : undefined,
    query: { enabled: marketCount !== undefined },
  });
  const b2 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "bracketTotals",
    args: marketCount !== undefined ? [marketCount, 2] : undefined,
    query: { enabled: marketCount !== undefined },
  });
  return [b0.data ?? 0n, b1.data ?? 0n, b2.data ?? 0n] as [bigint, bigint, bigint];
}

export function useUserStakes(marketCount: bigint | undefined, userAddress: `0x${string}` | undefined) {
  const s0 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "stakes",
    args: marketCount !== undefined && userAddress ? [marketCount, 0, userAddress] : undefined,
    query: { enabled: marketCount !== undefined && !!userAddress },
  });
  const s1 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "stakes",
    args: marketCount !== undefined && userAddress ? [marketCount, 1, userAddress] : undefined,
    query: { enabled: marketCount !== undefined && !!userAddress },
  });
  const s2 = useReadContract({
    address: RANGE_ZONE_ADDRESS,
    abi: RANGE_ZONE_ABI,
    functionName: "stakes",
    args: marketCount !== undefined && userAddress ? [marketCount, 2, userAddress] : undefined,
    query: { enabled: marketCount !== undefined && !!userAddress },
  });
  return [s0.data ?? 0n, s1.data ?? 0n, s2.data ?? 0n] as [bigint, bigint, bigint];
}

export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = (bracket: number, amountEth: string) => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "stake",
      args: [bracket as 0 | 1 | 2],
      value: parseEther(amountEth),
    });
  };

  return { stake, hash, isPending, isConfirming, isSuccess, error };
}

export function useResolve() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const resolve = () => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "resolve",
    });
  };

  return { resolve, hash, isPending, isConfirming, isSuccess, error };
}

export function useClaim() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = () => {
    writeContract({
      address: RANGE_ZONE_ADDRESS,
      abi: RANGE_ZONE_ABI,
      functionName: "claim",
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
