"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAllMarkets, MarketEntry } from "../hooks/useRangeZone";
import { MarketStateLabel, formatPrice, formatRbtc, getBracketLabel } from "../lib/rangeZoneContract";
import { Droplets, Hourglass } from 'lucide-react';
import Leaderboard from "../components/leaderboard";
import TradesChart from "../components/tradesChart";

function getMarketQuestion(marketId: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`market_question_${marketId}`) ?? "";
}

function getMarketImage(marketId: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`market_image_${marketId}`) ?? "";
}

function CountdownTimer({ expiry }: { expiry: bigint }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = Number(expiry) * 1000 - Date.now();
      if (diff <= 0) { setTime("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime(`${h}h ${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiry]);
  return <span>{time}</span>;
}

const STATE_COLORS: Record<number, string> = {
  0: "bg-green-100 text-green-800",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-purple-100 text-purple-800",
};

function MarketCard({ entry }: { entry: MarketEntry }) {
  const { id, market, bracketTotals } = entry;
  const [question, setQuestion] = useState("");
  const [marketImage, setMarketImage] = useState("");
  const [isExpiredOnChain, setIsExpiredOnChain] = useState(false);

  useEffect(() => {
    setQuestion(getMarketQuestion(id.toString()));
    setMarketImage(getMarketImage(id.toString()));
    const check = () => {
      if (!market) return;
      const expired = market.state === 0 && market.expiry > 0n && BigInt(Math.floor(Date.now() / 1000)) >= market.expiry;
      setIsExpiredOnChain(expired);
    };
    check();
    const t = setInterval(check, 5000);
    return () => clearInterval(t);
  }, [id, market]);

  if (!market) return null;

  const state = market.state;
  const totalPool = market.totalPool;
  const isOpen = state === 0;
  const isResolved = state === 2;
  const displayState = isExpiredOnChain ? "expired" : state;
  const stateLabel = displayState === "expired" ? "Expired" : (MarketStateLabel[state] ?? "Unknown");
  const stateBadgeClass = displayState === "expired" ? "bg-orange-100 text-orange-700" : (STATE_COLORS[state] ?? "");

  return (
    <div className="border border-[rgba(15,23,42,0.08)] rounded-xl overflow-hidden hover:shadow-md transition-all bg-white">
      {/* Header */}
      <div className="p-6 border-b border-[rgba(15,23,42,0.08)] flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {marketImage ? (
            <img
              src={marketImage}
              alt="Market"
              width={100}
              height={100}
              className="rounded-lg object-cover border border-[rgba(15,23,42,0.08)] shrink-0"
              style={{ width: 100, height: 100, minWidth: 100 }}
            />
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <h2 className="text-lg font-bold text-[#0f172a] line-clamp-2">
                {question || `BTC Market #${id.toString()}`}
              </h2>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold shrink-0 ${stateBadgeClass}`}>
                {stateLabel}
              </span>
            </div>
            <p className="text-sm text-[#64748b] line-clamp-2">
              Predict BTC price movement magnitude — direction doesn't matter, only magnitude.
            </p>
          </div>
        </div>
        {displayState === "expired" || isResolved ? (
          <Link
            href={`/market/${id.toString()}`}
            className="inline-flex items-center gap-2 bg-[rgba(15,23,42,0.08)] text-[#0f172a] hover:bg-[rgba(15,23,42,0.12)] no-underline px-4 py-2 rounded-lg font-semibold text-sm transition-colors shrink-0"
          >
            View Results
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <Link
            href={`/market/${id.toString()}`}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white no-underline px-4 py-2 rounded-lg font-semibold text-sm transition-colors shrink-0"
          >
            Trade
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[rgba(15,23,42,0.08)]">
        <div className="p-4">
          <p className="text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wide">Start Price</p>
          <p className="font-bold text-[#0f172a] text-lg">${formatPrice(market.startPrice)}</p>
        </div>
        <div className="p-4 flex flex-col">
          <p className="text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wide flex items-center gap-1">
            <Droplets size={14} /> Pool
          </p>
          <p className="font-bold text-[#0f172a] text-lg">{formatRbtc(totalPool)}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wide">Time {isOpen ? <Hourglass size={12} className="inline" /> : ""}</p>
          <p className="font-bold text-[#0f172a] text-lg">
            {isOpen ? <CountdownTimer expiry={market.expiry} /> : MarketStateLabel[state]}
          </p>
        </div>
        <div className="p-4">
          <p className="text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wide">Winner</p>
          <p className="font-bold text-[#0f172a] text-lg">
            {isResolved
              ? getBracketLabel(market.winningBracket, market.threshold1, market.threshold2)
              : "—"}
          </p>
        </div>
      </div>

      {/* Bracket distribution */}
      <div className="p-6 border-t border-[rgba(15,23,42,0.08)]">
        <p className="text-xs text-[#64748b] mb-4 font-semibold uppercase tracking-wider">Stake Distribution</p>
        <div className="space-y-3">
          {([0, 1, 2] as const).map((b) => {
            const label = getBracketLabel(b, market.threshold1, market.threshold2);
            const total = bracketTotals[b];
            const pct = totalPool > 0n ? Number((total * 100n) / totalPool) : 0;
            const isWinner = isResolved && market.winningBracket === b;
            return (
              <div key={b}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-semibold ${isWinner ? "text-green-700" : "text-[#0f172a]"}`}>
                    {label} {isWinner && "🏆"}
                  </span>
                  <span className="text-[#64748b] text-xs font-medium">{formatRbtc(total)} • {pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-[rgba(15,23,42,0.06)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isWinner ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-[#6366f1] to-[#818cf8]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { entries, isLoading } = useAllMarkets();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[rgba(15,23,42,0.02)]">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#0f172a] mb-2">RangeZone Markets</h1>
            <p className="text-lg text-[#64748b]">Predict BTC price movement magnitude and earn rewards</p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:from-orange-600 hover:to-orange-700 text-white no-underline px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <span>+ Create Market</span>
          </Link>
        </header>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main content - Markets */}
          <div className="lg:col-span-2">
            {isLoading && (
              <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-12 text-center text-[#64748b] bg-white">
                <div className="animate-pulse">
                  <div className="h-8 bg-[rgba(15,23,42,0.06)] rounded-lg mb-2 w-40 mx-auto"></div>
                  <p className="text-sm">Loading markets from blockchain…</p>
                </div>
              </div>
            )}

            {!isLoading && entries.length === 0 && (
              <div className="border border-dashed border-[rgba(15,23,42,0.08)] rounded-xl p-12 text-center bg-white">
                <p className="mb-3 font-semibold text-[#0f172a] text-lg">No markets yet</p>
                <p className="text-[#64748b] mb-6 max-w-sm mx-auto">
                  Markets will appear here once created. Start by creating the first market.
                </p>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white no-underline px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                >
                  Create Market
                </Link>
              </div>
            )}

            {!isLoading && entries.length > 0 && (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <MarketCard key={entry.id.toString()} entry={entry} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <Leaderboard />

            {/* Trading Activity */}
            <div>
              <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider px-1 mb-3">Your Trading Activity</h3>
              <TradesChart />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
