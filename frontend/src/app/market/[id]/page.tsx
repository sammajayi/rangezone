"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Info } from "lucide-react";
import { useAccount } from "wagmi";
import Chart from "../../../components/chart";
import { TradePanel } from "../../../components/tradePanel";
import { useMarketById, useBracketTotals } from "../../../hooks/useRangeZone";
import { MarketStateLabel, formatPrice, formatRbtc, getBracketLabel } from "../../../lib/rangeZoneContract";
import { Droplets } from 'lucide-react';


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
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setTime(`${d}d ${h}h ${m}m`);
      else if (h > 0) setTime(`${h}h ${m}m ${s}s`);
      else if (m > 0) setTime(`${m}m ${s}s`);
      else setTime(`${s}s`);
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

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const marketIdNum = Number(id);
  const marketId = !isNaN(marketIdNum) && marketIdNum > 0 ? BigInt(marketIdNum) : undefined;

  const { address } = useAccount();
  const { market: marketInfo, isLoading } = useMarketById(marketId);
  const bracketTotals = useBracketTotals(marketId);

  const [question, setQuestion] = useState("");

  useEffect(() => {
    if (id) setQuestion(getMarketQuestion(id));
  }, [id]);

  const hasMarket = !!marketInfo && marketInfo.expiry > 0n;
  const state = hasMarket ? marketInfo.state : -1;
  const isOpen = state === 0;
  const isResolved = state === 2;
  const totalPool = hasMarket ? marketInfo.totalPool : 0n;
  const expiry = hasMarket ? marketInfo.expiry : 0n;
  const expiryDate = expiry > 0n ? new Date(Number(expiry) * 1000) : null;
  const isExpiredOnChain = isOpen && expiry > 0n && BigInt(Math.floor(Date.now() / 1000)) >= expiry;
  const displayState = isExpiredOnChain ? "expired" : state;

  if (!marketId) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-2">Invalid market ID</h1>
          <Link href="/" className="inline-flex items-center gap-2 text-[#2563eb] no-underline">
            <ArrowLeft size={16} /> Back to Markets
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-center py-12 text-[#64748b]">Loading market…</div>
      </main>
    );
  }

  if (!hasMarket) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-2">Market not found</h1>
          <p className="text-[#64748b] mb-4">Market #{id} does not exist on-chain.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-[#2563eb] no-underline">
            <ArrowLeft size={16} /> Back to Markets
          </Link>
        </div>
      </main>
    );
  }

  const t1 = Number(marketInfo.threshold1);
  const t2 = Number(marketInfo.threshold2);

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[#64748b] no-underline mb-6 hover:text-[#0f172a] transition-colors text-sm"
      >
        <ArrowLeft size={16} /> All Markets
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-[#0f172a]">
            {question || `Will BTC price move within thresholds? — Market #${id}`}
          </h1>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
            displayState === "expired" ? "bg-orange-100 text-orange-700" : STATE_COLORS[state] ?? ""
          }`}>
            {displayState === "expired" ? "Expired — Awaiting Resolution" : (MarketStateLabel[state] ?? "Unknown")}
          </span>
        </div>
        <p className="text-[#64748b] text-sm">
          Market #{id} · Predict the magnitude of BTC price movement and earn RBTC
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-4">
          <p className="text-xs text-[#64748b] mb-1">Start Price</p>
          <p className="font-semibold text-[#0f172a]">{formatPrice(marketInfo.startPrice)}</p>
        </div>
        <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-4 flex">
          {/* <p className="text-xs text-[#64748b] mb-1">Total Pool</p> */}
          <span> <Droplets className="text-[#64748b]"/> </span>

          <p className="font-semibold text-[#0f172a]">{formatRbtc(totalPool)}</p>
        </div>
        <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-4">
          <p className="text-xs text-[#64748b] mb-1">{isOpen ? "" : "Expiry Date"}</p>
          <p className="font-semibold text-[#0f172a] flex items-center gap-1">
            <Clock size={14} className="text-[#64748b]" />
            {isOpen
              ? <CountdownTimer expiry={expiry} />
              : (expiryDate ? expiryDate.toLocaleDateString() : "—")}
          </p>
        </div>
        <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-4">
          <p className="text-xs text-[#64748b] mb-1">{isResolved ? "End Price" : "Thresholds"}</p>
          <p className="font-semibold text-[#0f172a]">
            {isResolved ? formatPrice(marketInfo.endPrice) : `${t1}% / ${t2}%`}
          </p>
        </div>
      </div>

      {/* Resolution info box */}
      <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-4 mb-6 bg-[rgba(99,102,241,0.03)]">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-[#6366f1] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#0f172a] mb-2">How this market resolves</p>
            <p className="text-sm text-[#475569] mb-2">
              At expiry the BTC oracle price is compared to the start price of{" "}
              <strong>{formatPrice(marketInfo.startPrice)}</strong>. The absolute percentage move (up or down)
              determines which bracket wins:
            </p>
            <ul className="space-y-1 text-sm text-[#475569]">
              <li>
                <span className="inline-block w-2 h-2 rounded-full bg-[#6366f1] mr-2" />
                <strong>Bracket 0</strong> — move &lt; {t1}% → resolves YES for this bracket
              </li>
              <li>
                <span className="inline-block w-2 h-2 rounded-full bg-[#f59e0b] mr-2" />
                <strong>Bracket 1</strong> — move between {t1}% and {t2}% → resolves YES for this bracket
              </li>
              <li>
                <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] mr-2" />
                <strong>Bracket 2</strong> — move &gt; {t2}% → resolves YES for this bracket
              </li>
            </ul>
            <p className="text-xs text-[#94a3b8] mt-2">
              Stakers in the winning bracket split the entire pool proportionally. All other stakes are lost.
            </p>
          </div>
        </div>
      </div>

      {/* Resolved result banner */}
      {isResolved && (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-green-800 mb-1">Market Resolved</p>
          <p className="text-sm text-green-700">
            End price: <strong>{formatPrice(marketInfo.endPrice)}</strong> ·{" "}
            Winning bracket: <strong>{getBracketLabel(marketInfo.winningBracket, marketInfo.threshold1, marketInfo.threshold2)}</strong>
          </p>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: brackets + chart */}
        <div className="lg:col-span-2 space-y-6">

          {/* Bracket breakdown */}
          <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#0f172a] mb-4">Bracket Stakes</p>
            <div className="space-y-3">
              {([0, 1, 2] as const).map((b) => {
                const label = getBracketLabel(b, marketInfo.threshold1, marketInfo.threshold2);
                const total = bracketTotals[b];
                const pct = totalPool > 0n ? Number((total * 100n) / totalPool) : 0;
                const isWinner = isResolved && marketInfo.winningBracket === b;
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

          {/* Staking chart */}
          <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-5">
            <p className="text-sm font-semibold text-[#0f172a] mb-4">Staking Activity</p>
            <Chart
              marketId={marketId}
              threshold1={marketInfo.threshold1}
              threshold2={marketInfo.threshold2}
              userAddress={address}
            />
          </div>
        </div>

        {/* Right: trade panel */}
        <div>
          <TradePanel marketId={marketId} />
        </div>
      </div>
    </main>
  );
}
