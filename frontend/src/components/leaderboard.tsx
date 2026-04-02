"use client";

import React, { useMemo } from "react";
import { useAllMarkets } from "../hooks/useRangeZone";
import { useLeaderboardFromSubgraph } from "../hooks/useSubgraph";
import { formatRbtc } from "../lib/rangeZoneContract";
import { Trophy } from "lucide-react";


// Dummy leaderboard data for demonstration (fallback when subgraph not available)
const DUMMY_LEADERBOARD: Array<{ address: string; totalStaked: bigint; totalClaimed: bigint }> = [];

export default function Leaderboard() {
  const { entries, isLoading: marketsLoading } = useAllMarkets();
  const { leaderboard: subgraphLeaderboard, loading: subgraphLoading } = useLeaderboardFromSubgraph();

  const leaderboard = useMemo(() => {
    if (subgraphLeaderboard && subgraphLeaderboard.length > 0) {
      // Sort by profit (totalClaimed - totalStaked) in descending order
      return [...subgraphLeaderboard].sort((a, b) => {
        const profitA = a.totalClaimed - a.totalStaked;
        const profitB = b.totalClaimed - b.totalStaked;
        return profitA > profitB ? -1 : 1;
      });
    }

    return DUMMY_LEADERBOARD.map((user) => ({
      address: user.address,
      totalStaked: user.totalStaked,
      totalClaimed: user.totalClaimed,
    }));
  }, [subgraphLeaderboard]);

  const isLoading = marketsLoading || subgraphLoading;

  const uniqueAddresses = new Set(leaderboard.map(u => u.address.toLowerCase())).size;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Leaderboard</p>
          <span className="px-2 py-1 text-xs font-semibold text-white bg-[#6366f1] rounded-full">{uniqueAddresses} Users</span>
        </div>
        <div className="text-xs text-[#64748b] text-center py-6">Loading leaderboard…</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="flex items-center gap-1">
       <Trophy size={30} className="text-yellow-500 inline-block mr-1" />
        <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">Leaderboard</p>
        </span>
        <span className="px-2 py-1 text-xs font-semibold text-white bg-linear-to-r from-orange-500 to-orange-600 rounded-full">{uniqueAddresses} Users</span>
      </div>
      <div className="border border-[rgba(15,23,42,0.12)] rounded-lg overflow-hidden bg-white shadow-sm">
        {leaderboard.length === 0 ? (
          <div className="text-xs text-[#64748b] text-center py-6">
            No stakers yet
          </div>
        ) : (
          <div className="divide-y divide-[rgba(15,23,42,0.06)]">
            {leaderboard.map((user, idx) => {
              const profit = user.totalClaimed - user.totalStaked;
              const isPositive = profit > 0n;

              return (
              <div
                key={user.address}
                className={`px-4 py-3 flex items-center justify-between text-xs hover:bg-[#6366f1]/3 transition-colors ${
                  idx < 3 ? "bg-linear-to-r from-transparent to-[rgba(99,102,241,0.05)]" : ""
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`font-bold w-6 text-center text-base ${
                    idx === 0 ? "text-yellow-500" :
                    idx === 1 ? "text-gray-400" :
                    idx === 2 ? "text-orange-500" :
                    "text-[#0f172a]"
                  }`}>
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                  </span>
                  <span className="text-[#64748b] font-mono truncate text-xs">
                    {user.address.slice(0, 6)}…{user.address.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className={`font-bold whitespace-nowrap text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? "+" : ""}{formatRbtc(profit)}
                  </span>
                  <span className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? "📈" : "📉"}
                  </span>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
