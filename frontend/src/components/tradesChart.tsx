"use client";

import React, { useMemo } from "react";
import { useUserTransactionHistory } from "../hooks/useSubgraph";
import { useAccount } from "wagmi";
import { formatRbtc } from "../lib/rangeZoneContract";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function TradesChart() {
  const { address } = useAccount();
  const { transactions, loading } = useUserTransactionHistory(address);

  const stats = useMemo(() => {
    if (!transactions) return null;

    const stakes = transactions.filter((t) => t.type === "stake");
    const claims = transactions.filter((t) => t.type === "claim");

    const totalStaked = stakes.reduce((sum, t) => sum + BigInt(t.amount), 0n);
    const totalClaimed = claims.reduce((sum, t) => sum + BigInt(t.amount), 0n);
    const roi = totalStaked > 0n ? ((totalClaimed - totalStaked) * 100n) / totalStaked : 0n;

    // Group by market
    const marketStats = new Map<string, { stakes: bigint; claims: bigint }>();
    stakes.forEach((t) => {
      const current = marketStats.get(t.marketId) || { stakes: 0n, claims: 0n };
      marketStats.set(t.marketId, { ...current, stakes: current.stakes + BigInt(t.amount) });
    });
    claims.forEach((t) => {
      const current = marketStats.get(t.marketId) || { stakes: 0n, claims: 0n };
      marketStats.set(t.marketId, { ...current, claims: current.claims + BigInt(t.amount) });
    });

    const topMarkets = Array.from(marketStats.entries())
      .map(([marketId, stats]) => ({
        marketId,
        stakes: stats.stakes,
        claims: stats.claims,
        profit: stats.claims - stats.stakes,
      }))
      .sort((a, b) => (b.stakes > a.stakes ? 1 : -1))
      .slice(0, 5);

    return { totalStaked, totalClaimed, roi, stakes: stakes.length, claims: claims.length, topMarkets };
  }, [transactions]);

  if (!address) {
    return (
      <div className="border border-[rgba(15,23,42,0.08)] rounded-lg p-8 text-center bg-white">
        <p className="text-sm text-[#64748b]">Connect your wallet to see your trading activity</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border border-[rgba(15,23,42,0.08)] rounded-lg p-8 text-center bg-white">
        <div className="animate-pulse">
          <div className="h-6 bg-[rgba(15,23,42,0.06)] rounded-lg mb-2 w-40 mx-auto"></div>
          <p className="text-sm text-[#64748b]">Loading your trading activity…</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.stakes === 0) {
    return (
      <div className="border border-[rgba(15,23,42,0.08)] rounded-lg p-8 text-center bg-white">
        <p className="text-sm text-[#64748b]">No trading activity yet</p>
      </div>
    );
  }

  const isProfit = stats.roi >= 0n;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-[rgba(15,23,42,0.08)] rounded-lg p-4 bg-white">
          <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider mb-1">Total Staked</p>
          <p className="text-xl font-bold text-[#0f172a]">{formatRbtc(stats.totalStaked)}</p>
          <p className="text-xs text-[#94a3b8] mt-1">{stats.stakes} transactions</p>
        </div>
        <div className="border border-[rgba(15,23,42,0.08)] rounded-lg p-4 bg-white">
          <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider mb-1">Total Claimed</p>
          <p className="text-xl font-bold text-green-600">{formatRbtc(stats.totalClaimed)}</p>
          <p className="text-xs text-[#94a3b8] mt-1">{stats.claims} transactions</p>
        </div>
        <div className="border border-[rgba(15,23,42,0.08)] rounded-lg p-4 bg-white">
          <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider mb-1">ROI</p>
          <div className="flex items-center gap-2">
            {isProfit ? (
              <TrendingUp size={20} className="text-green-600" />
            ) : (
              <TrendingDown size={20} className="text-red-600" />
            )}
            <p className={`text-xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
              {isProfit ? "+" : ""}{Number(stats.roi)}%
            </p>
          </div>
        </div>
      </div>

      {/* Top Markets */}
      {stats.topMarkets.length > 0 && (
        <div className="border border-[rgba(15,23,42,0.08)] rounded-lg bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(15,23,42,0.08)] bg-[rgba(15,23,42,0.02)]">
            <p className="text-sm font-semibold text-[#0f172a]">Top Markets</p>
          </div>
          <div className="divide-y divide-[rgba(15,23,42,0.06)]">
            {stats.topMarkets.map((market) => {
              const profit = market.claims - market.stakes;
              const isProfit = profit >= 0n;
              return (
                <div key={market.marketId} className="px-4 py-3 flex items-center justify-between hover:bg-[rgba(15,23,42,0.02)] transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0f172a]">Market #{market.marketId}</p>
                    <p className="text-xs text-[#64748b]">Staked: {formatRbtc(market.stakes)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
                      {isProfit ? "+" : ""}{formatRbtc(profit)}
                    </p>
                    <p className="text-xs text-[#64748b]">{isProfit ? "Profit" : "Loss"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
