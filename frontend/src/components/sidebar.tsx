"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAccount } from "wagmi";
import { TrendingUp, History, BookOpen, Trophy, X } from "lucide-react";
import Leaderboard from "./leaderboard";
import { useUserTransactions, useAllMarkets } from "../hooks/useRangeZone";
import { useUserTransactionHistory } from "../hooks/useSubgraph";
import { useSidebar } from "../app/sidebar-context";
import { formatRbtc } from "../lib/rangeZoneContract";

// Dummy data for demonstration (fallback when subgraph not available)
const DUMMY_USER_STATS = {
  totalStaked: BigInt("5000000000000000000"), // 5 tRBTC
  totalWinnings: BigInt("7500000000000000000"), // 7.5 tRBTC
  profit: BigInt("2500000000000000000"), // 2.5 tRBTC
  activeMarkets: 1,
};

export default function Sidebar() {
  const { address, isConnected } = useAccount();
  const { transactions: legacyTransactions } = useUserTransactions(address);
  const { transactions: subgraphTransactions, loading: subgraphLoading } = useUserTransactionHistory(address);
  const { entries } = useAllMarkets();
  const { sidebarOpen, closeSidebar } = useSidebar();

  
  const transactions = subgraphTransactions.length > 0 ? subgraphTransactions : legacyTransactions;

  // Calculate user stats from real data, fallback to dummy data
  const userStats = React.useMemo(() => {
    if (!address || !isConnected) {
      return { totalStaked: 0n, totalWinnings: 0n, profit: 0n, activeMarkets: 0 };
    }

    // Convert subgraph transactions to bigint format for consistency
    if (transactions && transactions.length > 0) {
      const totalStaked = transactions
        .filter((t) => t.type === "stake")
        .reduce((sum, t) => sum + BigInt(t.amount), 0n);

      const totalWinnings = transactions
        .filter((t) => t.type === "claim")
        .reduce((sum, t) => sum + BigInt(t.amount), 0n);

      const profit = totalWinnings - totalStaked;

      const activeMarkets = new Set(
        transactions
          .filter((t) => t.type === "stake")
          .map((t) => t.marketId.toString())
      ).size;

      return { totalStaked, totalWinnings, profit, activeMarkets };
    }

    // Fallback to dummy data for demo
    return DUMMY_USER_STATS;
  }, [transactions, address, isConnected]);

  const menuItems = [
    { icon: Trophy, label: "Leaderboard", href: "/" },
    { icon: BookOpen, label: "How it works", href: "/learn" },
    { icon: History, label: "Transactions", href: "/transaction" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-72 bg-gradient-to-b from-white to-[rgba(15,23,42,0.02)] border-r border-[rgba(15,23,42,0.12)] overflow-y-auto transition-transform duration-300 ease-in-out z-40 lg:static lg:top-0 lg:w-96 lg:border-r lg:border-r-[rgba(15,23,42,0.08)] lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-5 space-y-8 lg:p-7 lg:space-y-10">
          {/* Close button - mobile only */}
          <button
            onClick={closeSidebar}
            className="lg:hidden inline-flex p-1 text-[#0f172a] hover:bg-[rgba(15,23,42,0.04)] rounded-lg"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

          {/* Logo - desktop only */}
          <Link href="/" className="hidden lg:inline-flex items-center gap-2 no-underline text-[#0f172a] font-semibold border border-gray-200 rounded-lg p-10 mx-auto">
            <Image src="/rangezone-logo.svg" alt="RangeZone Logo" width={60} height={60} className="w-10 h-10" />
            <span className="font-bold">RangeZone</span>
          </Link>

          {/* User Stats Section */}
          {isConnected ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#0f172a] uppercase tracking-wide px-1">Your Stats</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#6366f1] rounded-lg p-3 bg-gradient-to-br from-[#6366f1]/10 to-transparent hover:shadow-md transition-shadow">
                  <p className="text-xs text-[#64748b] mb-1 font-semibold">Total Stake</p>
                  <p className="text-base font-bold text-[#0f172a]">
                    {formatRbtc(userStats.totalStaked)}
                  </p>
                </div>
                <div className="border border-orange-500 rounded-lg p-3 bg-gradient-to-br from-orange-50 to-transparent hover:shadow-md transition-shadow">
                  <p className="text-xs text-[#64748b] mb-1 font-semibold">Winnings</p>
                  <p className="text-base font-bold text-orange-600">
                    {formatRbtc(userStats.totalWinnings)}
                  </p>
                </div>
                <div className={`border rounded-lg p-3 bg-gradient-to-br transition-shadow hover:shadow-md ${
                  userStats.profit >= 0n
                    ? "border-green-300 from-green-50 to-transparent"
                    : "border-red-300 from-red-50 to-transparent"
                }`}>
                  <p className="text-xs text-[#64748b] mb-1 font-semibold">Profit/Loss</p>
                  <p
                    className={`text-base font-bold ${
                      userStats.profit >= 0n ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {userStats.profit >= 0n ? "+" : ""}
                    {formatRbtc(userStats.profit)}
                  </p>
                </div>
                <div className="border border-orange-400 rounded-lg p-3 bg-gradient-to-br from-orange-50 to-transparent hover:shadow-md transition-shadow">
                  <p className="text-xs text-[#64748b] mb-1 font-semibold">Active</p>
                  <p className="text-base font-bold text-orange-600">
                    {userStats.activeMarkets}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#6366f1] rounded-lg p-4 bg-[#6366f1]/5 text-center">
              <p className="text-xs text-[#64748b] font-medium">Connect wallet</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2 border-t border-b border-[rgba(15,23,42,0.08)] py-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#0f172a] hover:bg-[#6366f1]/10 hover:text-[#6366f1] transition-all hover:border-l-3 hover:border-[#6366f1] hover:pl-[13px]"
              >
                <item.icon size={20} className="text-[#64748b] group-hover:text-[#6366f1]" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Leaderboard */}
          <Leaderboard />
        </div>
      </aside>
    </>
  );
}
