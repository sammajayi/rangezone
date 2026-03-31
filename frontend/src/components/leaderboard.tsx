"use client";

import React, { useMemo } from "react";
import { useAllMarkets } from "../hooks/useRangeZone";
import { useLeaderboardFromSubgraph } from "../hooks/useSubgraph";
import { formatRbtc } from "../lib/rangeZoneContract";

// Dummy leaderboard data for demonstration (fallback when subgraph not available)
const DUMMY_LEADERBOARD = [
  // { address: "0x742d35Cc6634C0532925a3b844Bc2e7c1d4a0b9f", totalStaked: BigInt("50000000000000000000"), totalClaimed: BigInt("75000000000000000000") },
  // { address: "0x8ba1f109551bD432803012645Ac136ddd64DBA72", totalStaked: BigInt("35000000000000000000"), totalClaimed: BigInt("52500000000000000000") },
  // { address: "0x9de8d524aEd2c73ce46b725f21fe547ab5db1b59", totalStaked: BigInt("28000000000000000000"), totalClaimed: BigInt("42000000000000000000") },
  // { address: "0x1234567890123456789012345678901234567890", totalStaked: BigInt("22000000000000000000"), totalClaimed: BigInt("33000000000000000000") },
  // { address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", totalStaked: BigInt("18000000000000000000"), totalClaimed: BigInt("27000000000000000000") },
  // { address: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef", totalStaked: BigInt("15000000000000000000"), totalClaimed: BigInt("22500000000000000000") },
  // { address: "0x1111111111111111111111111111111111111111", totalStaked: BigInt("12000000000000000000"), totalClaimed: BigInt("18000000000000000000") },
  // { address: "0x2222222222222222222222222222222222222222", totalStaked: BigInt("10000000000000000000"), totalClaimed: BigInt("15000000000000000000") },
  // { address: "0x3333333333333333333333333333333333333333", totalStaked: BigInt("8000000000000000000"), totalClaimed: BigInt("12000000000000000000") },
  // { address: "0x4444444444444444444444444444444444444444", totalStaked: BigInt("6000000000000000000"), totalClaimed: BigInt("9000000000000000000") },
];

export default function Leaderboard() {
  const { entries, isLoading: marketsLoading } = useAllMarkets();
  const { leaderboard: subgraphLeaderboard, loading: subgraphLoading } = useLeaderboardFromSubgraph();

  const leaderboard = useMemo(() => {

    if (subgraphLeaderboard && subgraphLeaderboard.length > 0) {
      return subgraphLeaderboard;
    }
   
    return DUMMY_LEADERBOARD.map((user) => ({
      address: user.address,
      totalStaked: user.totalStaked,
      totalClaimed: user.totalClaimed,
    }));
  }, [subgraphLeaderboard]);

  const isLoading = marketsLoading || subgraphLoading;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">Top Stakers</p>
          <span className="px-2 py-1 text-xs font-semibold text-white bg-[#6366f1] rounded-full">Top</span>
        </div>
        <div className="text-xs text-[#64748b] text-center py-4">Loading leaderboard…</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wide">Top Stakers</p>
        <span className="px-2 py-1 text-xs font-semibold text-white bg-gradient-to-r from-[#6366f1] to-blue-500 rounded-full">Top 10</span>
      </div>
      <div className="border border-[rgba(15,23,42,0.12)] rounded-lg overflow-hidden bg-white shadow-sm">
        {leaderboard.length === 0 ? (
          <div className="text-xs text-[#64748b] text-center py-4">
            No stakers yet
          </div>
        ) : (
          <div className="divide-y divide-[rgba(15,23,42,0.08)]">
            {leaderboard.map((user, idx) => (
              <div key={user.address} className="px-4 py-3 flex items-center justify-between text-xs hover:bg-[#6366f1]/5 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`font-bold w-6 text-center ${
                    idx === 0 ? "text-yellow-500 text-lg" :
                    idx === 1 ? "text-gray-400 text-lg" :
                    idx === 2 ? "text-orange-500 text-lg" :
                    "text-[#0f172a]"
                  }`}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                  </span>
                  <span className="text-[#64748b] font-mono truncate text-xs">
                    {user.address.slice(0, 6)}…{user.address.slice(-4)}
                  </span>
                </div>
                <span className="text-[#0f172a] font-bold ml-2 whitespace-nowrap">{formatRbtc(user.totalStaked)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-[#94a3b8] text-center">Data updates daily • Based on stakes across all markets</p>
    </div>
  );
}
