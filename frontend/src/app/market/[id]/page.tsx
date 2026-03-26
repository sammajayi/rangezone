"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, MessageSquare, Send } from "lucide-react";
import { useAccount } from "wagmi";
import Chart from "../../../components/chart";
import { TradePanel } from "../../../components/tradePanel";
import { useCurrentMarket, useBracketTotals } from "../../../hooks/useRangeZone";
import { MarketStateLabel, formatPrice, formatRbtc, getBracketLabel } from "../../../lib/rangeZoneContract";

interface Comment {
  id: string;
  author: string;
  authorAddress: string;
  content: string;
  timestamp: string;
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

export default function MarketDetailPage() {
  const { address, isConnected } = useAccount();
  const { data: currentMarket, isLoading } = useCurrentMarket();

  const marketId = currentMarket ? currentMarket[0] : undefined;
  const marketInfo = currentMarket ? currentMarket[1] : undefined;
  const bracketTotals = useBracketTotals(marketId);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const hasMarket = marketInfo && marketInfo.expiry > 0n;
  const state = hasMarket ? Number(marketInfo.state) : -1;
  const isOpen = state === 0;
  const isResolved = state === 2;
  const totalPool = hasMarket ? marketInfo.totalPool : 0n;
  const expiry = hasMarket ? marketInfo.expiry : 0n;
  const expiryDate = expiry > 0n ? new Date(Number(expiry) * 1000) : null;

  const stateColors: Record<number, string> = {
    0: "bg-green-100 text-green-800",
    1: "bg-yellow-100 text-yellow-700",
    2: "bg-purple-100 text-purple-800",
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      author: `${address?.slice(0, 6)}…${address?.slice(-4)}`,
      authorAddress: address ?? "0x0000…0000",
      content: newComment,
      timestamp: new Date().toISOString(),
    };
    setComments([comment, ...comments]);
    setNewComment("");
  };

  const formatCommentTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  };

  if (isLoading) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-center py-12 text-[#64748b]">Loading market data from chain…</div>
      </main>
    );
  }

  if (!hasMarket) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold mb-2">No active market</h1>
          <p className="text-[#64748b] mb-4">No market has been created yet.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-[#2563eb] no-underline">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#0f172a] mb-6 no-underline"
      >
        <ArrowLeft size={16} />
        Back to Markets
      </Link>

      {/* Market Header */}
      <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-[#0f172a]">
                BTC Price Movement Market {marketId !== undefined ? `#${marketId.toString()}` : ""}
              </h1>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${stateColors[state] ?? ""}`}>
                {MarketStateLabel[state] ?? "Unknown"}
              </span>
            </div>
            <p className="text-[#475569]">
              Predict how much BTC will move by expiry — direction doesn't matter, only the magnitude counts.
              {isResolved && (
                <span className="ml-2 text-purple-700 font-medium">
                  Winner: {getBracketLabel(marketInfo.winningBracket, marketInfo.threshold1, marketInfo.threshold2)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#64748b]" />
            <div>
              <p className="text-xs text-[#64748b]">{isOpen ? "Time Remaining" : "Status"}</p>
              <p className="text-sm font-semibold text-[#0f172a]">
                {isOpen ? <CountdownTimer expiry={expiry} /> : MarketStateLabel[state]}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#64748b]">Start Price</p>
            <p className="text-sm font-semibold text-[#0f172a]">{formatPrice(marketInfo.startPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-[#64748b]">
              {isResolved ? "End Price" : "Total Pool"}
            </p>
            <p className="text-sm font-semibold text-[#0f172a]">
              {isResolved ? formatPrice(marketInfo.endPrice) : formatRbtc(totalPool)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#64748b]">Expiry</p>
            <p className="text-sm font-semibold text-[#0f172a]">
              {expiryDate?.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Bracket Distribution + Staking Chart + Trade Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 border border-[rgba(15,23,42,0.08)] rounded-xl p-6 space-y-6">
          {/* Bracket bars */}
          <div>
            <h3 className="text-sm font-medium text-[#64748b] mb-3">Bracket Distribution</h3>
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
                      <span className="text-[#64748b]">{formatRbtc(total)} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[rgba(15,23,42,0.06)] overflow-hidden">
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

          {/* Staking activity chart */}
          <div className="border-t border-[rgba(15,23,42,0.08)] pt-4">
            <Chart
              marketId={marketId}
              threshold1={marketInfo.threshold1}
              threshold2={marketInfo.threshold2}
            />
          </div>
        </div>

        <div className="space-y-4">
          <TradePanel />
        </div>
      </div>

      {/* Comments Section */}
      <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={20} className="text-[#0f172a]" />
          <h2 className="text-lg font-semibold text-[#0f172a]">Comments</h2>
          <span className="text-sm text-[#64748b]">({comments.length})</span>
        </div>

        <form onSubmit={handleCommentSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isConnected ? "Add a comment…" : "Connect wallet to comment"}
              disabled={!isConnected}
              className="flex-1 px-4 py-2 border border-[rgba(15,23,42,0.08)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a] disabled:bg-[rgba(15,23,42,0.04)] disabled:cursor-not-allowed"
            />
            <button
            title="submit"
              type="submit"
              disabled={!isConnected || !newComment.trim()}
              className="px-4 py-2 bg-[#0f172a] text-white rounded-lg hover:bg-[#0b1324] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-[#64748b] text-center py-8">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="pb-4 border-b border-[rgba(15,23,42,0.08)] last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[rgba(15,23,42,0.08)] flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#0f172a]">{comment.author[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0f172a]">{comment.author}</p>
                      <p className="text-xs text-[#64748b]">{comment.authorAddress}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#0f172a] mb-1">{comment.content}</p>
                <p className="text-xs text-[#64748b]">{formatCommentTime(comment.timestamp)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
