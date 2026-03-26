"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMarketInfo, useMarketCount, useBracketTotals } from "../hooks/useRangeZone";
import { MarketStateLabel, formatPrice, formatRbtc, getBracketLabel } from "../lib/rangeZoneContract";

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

export default function Page() {
  const { data: marketInfo, isLoading, error, refetch } = useMarketInfo();
  const { data: marketCount } = useMarketCount();
  const bracketTotals = useBracketTotals(marketCount as bigint | undefined);

  const hasMarket = marketInfo && marketInfo.expiry > 0n;
  const state = hasMarket ? Number(marketInfo.state) : -1;
  const totalPool = hasMarket ? marketInfo.totalPool : 0n;

  const stateColors: Record<number, string> = {
    0: "bg-green-100 text-green-800",
    1: "bg-yellow-100 text-yellow-700",
    2: "bg-purple-100 text-purple-800",
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">RangeZone Market</h1>
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
          Loading market data from chain…
        </div>
      )}

      {error && (
        <div className="border border-red-200 rounded-xl p-6 bg-red-50 text-red-700">
          Failed to load market data. Check your network connection and try again.
          <button onClick={() => refetch()} className="ml-4 underline text-sm">Retry</button>
        </div>
      )}

      {!isLoading && !error && !hasMarket && (
        <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-8 text-center text-[#64748b]">
          <p className="mb-2 font-medium">No active market</p>
          <p className="text-sm">
            Anyone can create a new market from the{" "}
            <Link href="/create" className="underline">create page</Link>.
          </p>
        </div>
      )}

      {hasMarket && (
        <div className="border border-[rgba(15,23,42,0.08)] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[rgba(15,23,42,0.08)] flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-[#0f172a]">BTC Price Movement Market</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${stateColors[state] ?? ""}`}>
                  {MarketStateLabel[state] ?? "Unknown"}
                </span>
              </div>
              <p className="text-sm text-[#64748b]">
                Predict how much BTC will move by expiry — direction doesn't matter, only magnitude.
              </p>
            </div>
            <Link
              href="/market/1"
              className="inline-flex items-center gap-2 bg-[#0f172a] text-white no-underline px-4 py-2 rounded-lg font-semibold text-sm"
            >
              View &amp; Trade →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[rgba(15,23,42,0.08)]">
            <div className="p-4">
              <p className="text-xs text-[#64748b] mb-1">Start Price</p>
              <p className="font-semibold text-[#0f172a]">{formatPrice(marketInfo.startPrice)}</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-[#64748b] mb-1">Total Pool</p>
              <p className="font-semibold text-[#0f172a]">{formatRbtc(totalPool)}</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-[#64748b] mb-1">Expires In</p>
              <p className="font-semibold text-[#0f172a]">
                {state === 0 ? <CountdownTimer expiry={marketInfo.expiry} /> : MarketStateLabel[state]}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-[#64748b] mb-1">Winning Bracket</p>
              <p className="font-semibold text-[#0f172a]">
                {state === 2
                  ? getBracketLabel(marketInfo.winningBracket, marketInfo.threshold1, marketInfo.threshold2)
                  : "—"}
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-[rgba(15,23,42,0.08)]">
            <p className="text-xs text-[#64748b] mb-3 font-medium uppercase tracking-wide">Bracket Stakes</p>
            <div className="space-y-2">
              {([0, 1, 2] as const).map((b) => {
                const label = getBracketLabel(b, marketInfo.threshold1, marketInfo.threshold2);
                const total = bracketTotals[b];
                const pct = totalPool > 0n ? Number((total * 100n) / totalPool) : 0;
                const isWinner = state === 2 && marketInfo.winningBracket === b;
                return (
                  <div key={b}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-medium ${isWinner ? "text-green-700" : "text-[#0f172a]"}`}>
                        Bracket {b}: {label} {isWinner && "🏆"}
                      </span>
                      <span className="text-[#64748b]">{formatRbtc(total)} ({pct}%)</span>
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
      )}
    </main>
  );
}
