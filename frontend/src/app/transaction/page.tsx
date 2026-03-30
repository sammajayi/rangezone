"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useUserTransactions } from "../../hooks/useRangeZone";
import { formatRbtc, getBracketLabel } from "../../lib/rangeZoneContract";
import { useMarketById } from "../../hooks/useRangeZone";

function TxRow({ tx }: { tx: import("../../hooks/useRangeZone").UserTransaction }) {
  const { market } = useMarketById(tx.marketId);

  const isStake = tx.type === "stake";
  const bracketLabel =
    market && tx.bracket !== undefined
      ? getBracketLabel(tx.bracket, market.threshold1, market.threshold2)
      : tx.bracket !== undefined
      ? `Bracket ${tx.bracket}`
      : "—";

  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(15,23,42,0.06)] last:border-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            isStake ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
          }`}
        >
          {isStake ? "S" : "C"}
        </div>
        <div>
          <p className="text-sm font-medium text-[#0f172a]">
            {isStake ? "Staked" : "Claimed"} on Market #{tx.marketId.toString()}
          </p>
          {isStake && (
            <p className="text-xs text-[#64748b]">Bracket: {bracketLabel}</p>
          )}
          <p className="text-xs text-[#94a3b8] font-mono">
            Tx:{" "}
            <a
              href={`https://explorer.testnet.rsk.co/tx/${tx.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#6366f1]"
            >
              {tx.txHash.slice(0, 10)}…{tx.txHash.slice(-6)}
            </a>
          </p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p
          className={`text-sm font-semibold ${
            isStake ? "text-[#0f172a]" : "text-green-600"
          }`}
        >
          {isStake ? "−" : "+"}{formatRbtc(tx.amount)}
        </p>
        <p className="text-xs text-[#94a3b8]">Block #{tx.blockNumber.toString()}</p>
      </div>
    </div>
  );
}

export default function TransactionPage() {
  const { address, isConnected } = useAccount();
  const { transactions, isLoading, error } = useUserTransactions(address);

  if (!isConnected) {
    return (
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold mb-2">Transaction History</h1>
            <p className="text-[#64748b]">Connect your wallet to view your activity</p>
          </header>
          <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-10 flex flex-col items-center justify-center gap-4">
            <p className="text-[#64748b] text-center">Please connect your wallet to see your transaction history</p>
            <ConnectButton />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#0f172a] mb-4 no-underline"
          >
            <span aria-hidden="true">←</span>
            Back to Markets
          </Link>
          <h1 className="text-2xl font-semibold mb-1">Transaction History</h1>
          <p className="text-[#64748b] text-sm">All your stakes and winnings claimed on-chain</p>
        </header>

        <div className="border border-[rgba(15,23,42,0.08)] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(15,23,42,0.08)] flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#0f172a]">Activity</h2>
            <div className="flex gap-3 text-xs text-[#64748b]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                Stake
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Claim
              </span>
            </div>
          </div>

          <div className="px-6">
            {isLoading && (
              <p className="text-sm text-[#64748b] py-8 text-center">Loading transactions…</p>
            )}

            {!isLoading && error && (
              <div className="text-center py-10">
                <p className="text-sm font-medium text-red-600 mb-1">Could not load transactions</p>
                <p className="text-xs text-[#64748b]">{error}</p>
              </div>
            )}

            {!isLoading && !error && transactions.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm font-medium text-[#0f172a] mb-1">No transactions yet</p>
                <p className="text-xs text-[#64748b]">
                  Once you stake or claim winnings, they'll appear here.
                </p>
                <Link
                  href="/"
                  className="inline-block mt-4 px-4 py-2 bg-[#0f172a] text-white rounded-lg text-sm font-semibold no-underline"
                >
                  Browse Markets
                </Link>
              </div>
            )}

            {!isLoading && transactions.length > 0 && (
              <div>
                {transactions.map((tx, i) => (
                  <TxRow key={`${tx.txHash}-${i}`} tx={tx} />
                ))}
              </div>
            )}
          </div>

          {!isLoading && transactions.length > 0 && (
            <div className="px-6 py-3 border-t border-[rgba(15,23,42,0.08)] bg-[rgba(15,23,42,0.02)]">
              <p className="text-xs text-[#64748b]">
                {transactions.filter((t) => t.type === "stake").length} stakes ·{" "}
                {transactions.filter((t) => t.type === "claim").length} claims
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
