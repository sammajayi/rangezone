"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAllMarkets, MarketEntry } from "../hooks/useRangeZone";
import { MarketStateLabel, formatPrice, formatRbtc, getBracketLabel } from "../lib/rangeZoneContract";

function getMarketQuestion(marketId: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`market_question_${marketId}`) ?? "";
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
  const [isExpiredOnChain, setIsExpiredOnChain] = useState(false);
  useEffect(() => {
    setQuestion(getMarketQuestion(id.toString()));
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

  return (
    <div className="border border-[rgba(15,23,42,0.08)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[rgba(15,23,42,0.08)] flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold text-[#0f172a]">
              {question || `BTC Market #${id.toString()}`}
            </h2>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              displayState === "expired" ? "bg-orange-100 text-orange-700" : STATE_COLORS[state] ?? ""
            }`}>
              {displayState === "expired" ? "Expired" : (MarketStateLabel[state] ?? "Unknown")}
            </span>
          </div>
          <p className="text-sm text-[#64748b]">
            Predict how much BTC will move by expiry — direction doesn't matter, only magnitude.
          </p>
        </div>
        {displayState === "expired" || isResolved ? (
          <Link
            href={`/market/${id.toString()}`}
            className="inline-flex items-center gap-2 bg-[rgba(15,23,42,0.08)] text-[#64748b] no-underline px-4 py-2 rounded-lg font-semibold text-sm"
          >
            View Results →
          </Link>
        ) : (
          <Link
            href={`/market/${id.toString()}`}
            className="inline-flex items-center gap-2 bg-[#0f172a] text-white no-underline px-4 py-2 rounded-lg font-semibold text-sm"
          >
            View &amp; Trade →
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[rgba(15,23,42,0.08)]">
        <div className="p-4">
          <p className="text-xs text-[#64748b] mb-1">Start Price</p>
          <p className="font-semibold text-[#0f172a] text-sm">{formatPrice(market.startPrice)}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-[#64748b] mb-1">Total Pool</p>
          <p className="font-semibold text-[#0f172a] text-sm">{formatRbtc(totalPool)}</p>
        </div>
        <div className="p-4">
          <p className="text-xs text-[#64748b] mb-1">{isOpen ? "Expires In" : "Status"}</p>
          <p className="font-semibold text-[#0f172a] text-sm">
            {isOpen ? <CountdownTimer expiry={market.expiry} /> : MarketStateLabel[state]}
          </p>
        </div>
        <div className="p-4">
          <p className="text-xs text-[#64748b] mb-1">Winning Bracket</p>
          <p className="font-semibold text-[#0f172a] text-sm">
            {isResolved
              ? getBracketLabel(market.winningBracket, market.threshold1, market.threshold2)
              : "—"}
          </p>
        </div>
      </div>

      {/* Bracket distribution */}
      <div className="p-5 border-t border-[rgba(15,23,42,0.08)]">
        <p className="text-xs text-[#64748b] mb-3 font-medium uppercase tracking-wide">Bracket Stakes</p>
        <div className="space-y-2">
          {([0, 1, 2] as const).map((b) => {
            const label = getBracketLabel(b, market.threshold1, market.threshold2);
            const total = bracketTotals[b];
            const pct = totalPool > 0n ? Number((total * 100n) / totalPool) : 0;
            const isWinner = isResolved && market.winningBracket === b;
            return (
              <div key={b}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={`font-medium ${isWinner ? "text-green-700" : "text-[#0f172a]"}`}>
                    {label} {isWinner && "🏆"}
                  </span>
                  <span className="text-[#64748b] text-xs">{formatRbtc(total)} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-[rgba(15,23,42,0.06)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isWinner ? "bg-green-500" : "bg-[#6366f1]"}`}
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
    <main className="max-w-[1200px] mx-auto px-4 py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">RangeZone Markets</h1>
          <p className="text-[#64748b]">Predict the magnitude of BTC price movement and earn RBTC</p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 bg-[#0f172a] text-white no-underline px-4 py-2 rounded-lg font-semibold"
        >
          Create market
        </Link>
      </header>

      {isLoading && (
        <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-8 text-center text-[#64748b]">
          Loading markets from chain…
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-8 text-center text-[#64748b]">
          <p className="mb-2 font-medium">No markets yet</p>
          <p className="text-sm">
            The contract owner can create the first market from the{" "}
            <Link href="/create" className="underline">create page</Link>.
          </p>
        </div>
      )}

      {!isLoading && entries.length > 0 && (
        <div className="space-y-4">
          {entries.map((entry) => (
            <MarketCard key={entry.id.toString()} entry={entry} />
          ))}
        </div>
      )}
    </main>
  );
}
