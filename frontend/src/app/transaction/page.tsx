"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useUserTransactionHistory } from "../../hooks/useSubgraph";
import { formatRbtc, getBracketLabel } from "../../lib/rangeZoneContract";
import { useMarketById } from "../../hooks/useRangeZone";
import { format } from "date-fns";
import { History } from "lucide-react";

function TxRow({ tx }: { tx: any }) {
  const { market } = useMarketById(tx.marketId ? BigInt(tx.marketId) : undefined);

  const isStake = tx.type === "stake";
  const bracketLabel =
    market && tx.bracket !== undefined
      ? getBracketLabel(tx.bracket, market.threshold1, market.threshold2)
      : tx.bracket !== undefined
      ? `Bracket ${tx.bracket}`
      : "—";

  const timestamp = new Date(tx.blockTimestamp * 1000);
  const formattedDate = format(timestamp, "MMM dd, yyyy HH:mm");

  return (
    <div className="py-4 flex items-start justify-between gap-4 hover:bg-[rgba(15,23,42,0.02)] transition-colors">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            isStake ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
          }`}
        >
          {isStake ? "📍" : "🎁"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0f172a]">
            {isStake ? "Staked" : "Claimed"} on Market #{tx.marketId}
          </p>
          {isStake && (
            <p className="text-xs text-[#64748b] mt-1">Bracket: <span className="font-semibold">{bracketLabel}</span></p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs">
            <p className="text-[#94a3b8]">{formattedDate}</p>
            <p className="text-[#94a3b8] font-mono">
              Tx:{" "}
              <a
                href={`https://explorer.testnet.rsk.co/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6366f1] hover:text-[#4f46e5] underline font-semibold"
              >
                {tx.txHash.slice(0, 10)}…{tx.txHash.slice(-6)}
              </a>
            </p>
            <p className="text-[#94a3b8]">Block #{tx.blockNumber}</p>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p
          className={`text-lg font-bold ${
            isStake ? "text-[#0f172a]" : "text-green-600"
          }`}
        >
          {isStake ? "−" : "+"}{formatRbtc(BigInt(tx.amount))}
        </p>
        <p className={`text-xs font-semibold mt-1 ${isStake ? "text-[#64748b]" : "text-green-600"}`}>
          {isStake ? "Staked" : "Received"}
        </p>
      </div>
    </div>
  );
}

export default function TransactionPage() {
  const { address, isConnected } = useAccount();
  const { transactions, loading } = useUserTransactionHistory(address);

  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[rgba(15,23,42,0.02)]">
        <div className="max-w-2xl w-full mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#0f172a] mb-2">Transaction History</h1>
            <p className="text-lg text-[#64748b]">Connect your wallet to view your trading activity</p>
          </div>
          <div className="border border-dashed border-[rgba(15,23,42,0.12)] rounded-xl p-12 flex flex-col items-center justify-center gap-6 bg-white">
            <div className="w-16 h-16 rounded-full bg-[#6366f1]/10 flex items-center justify-center">
              <History size={32} className="text-[#6366f1]" />
            </div>
            <p className="text-[#64748b] text-center text-lg">Connect your wallet to see your transaction history</p>
            <ConnectButton />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[rgba(15,23,42,0.02)]">
      <div className="max-w-300 mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6366f1] hover:text-[#4f46e5] mb-6 no-underline group"
            >
              <span aria-hidden="true" className="group-hover:-translate-x-1 transition-transform">←</span>
              Back to Markets
            </Link>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#0f172a] mb-2">Transaction History</h1>
            <p className="text-lg text-[#64748b]">All your stakes and claimed rewards on-chain</p>
          </header>

          <div className="border border-[rgba(15,23,42,0.08)] rounded-xl overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-[rgba(15,23,42,0.08)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-[#0f172a]">Activity Log</h2>
              {!loading && transactions.length > 0 && (
                <div className="flex gap-4 text-sm text-[#64748b]">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
                    Stake
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
                    Claim
                  </span>
                </div>
              )}
            </div>

            <div className="px-6">
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-pulse">
                    <div className="h-6 bg-[rgba(15,23,42,0.06)] rounded-lg mb-4 w-40 mx-auto"></div>
                    <p className="text-sm text-[#64748b]">Loading your transactions…</p>
                  </div>
                </div>
              )}

              {!loading && transactions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-[rgba(15,23,42,0.06)] flex items-center justify-center mx-auto mb-4">
                    <History size={24} className="text-[#64748b]" />
                  </div>
                  <p className="text-lg font-semibold text-[#0f172a] mb-1">No transactions yet</p>
                  <p className="text-sm text-[#64748b] mb-6">
                    Your stakes and claimed rewards will appear here
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-lg font-semibold text-sm no-underline hover:bg-[#4f46e5] transition-colors"
                  >
                    Browse Markets
                  </Link>
                </div>
              )}

              {!loading && transactions.length > 0 && (
                <div className="divide-y divide-[rgba(15,23,42,0.06)]">
                  {transactions.map((tx, i) => (
                    <TxRow key={`${tx.txHash}-${i}`} tx={tx} />
                  ))}
                </div>
              )}
            </div>

            {!loading && transactions.length > 0 && (
              <div className="px-6 py-4 border-t border-[rgba(15,23,42,0.08)] bg-[rgba(15,23,42,0.02)]">
                <p className="text-sm text-[#64748b] font-medium">
                  <span className="font-semibold text-[#0f172a]">{transactions.filter((t) => t.type === "stake").length}</span> stakes · <span className="font-semibold text-[#0f172a]">{transactions.filter((t) => t.type === "claim").length}</span> claims
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
