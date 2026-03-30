"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ExternalLink } from "lucide-react";
import {
  useMarketById,
  useBracketTotals,
  useUserStakes,
  useStake,
  useResolve,
  useClaim,
  useWithdrawFee,
  useContractOwner,
} from "../hooks/useRangeZone";
import { MarketStateLabel, formatRbtc, getBracketLabel } from "../lib/rangeZoneContract";

const RSK_TESTNET_CHAIN_ID = 31;

interface TradePanelProps {
  marketId: bigint;
}

export function TradePanel({ marketId }: TradePanelProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const isWrongNetwork = isConnected && chainId !== RSK_TESTNET_CHAIN_ID;

  const { market: marketInfo, refetch } = useMarketById(marketId);
  const { data: owner } = useContractOwner();

  const bracketTotals = useBracketTotals(marketId);
  const userStakes = useUserStakes(marketId, address);

  const [selectedBracket, setSelectedBracket] = useState<0 | 1 | 2 | null>(null);
  const [amount, setAmount] = useState("");
  const [txMessage, setTxMessage] = useState<string | null>(null);
  const [showFaucetHint, setShowFaucetHint] = useState(false);

  const { stake, isPending: staking, isConfirming: stakingConfirming, isSuccess: stakeSuccess, error: stakeError } = useStake();
  const { resolve, isPending: resolving, isConfirming: resolvingConfirming, isSuccess: resolveSuccess, error: resolveError } = useResolve();
  const { claim, isPending: claiming, isConfirming: claimingConfirming, isSuccess: claimSuccess, error: claimError } = useClaim();
  const { withdrawFee, isPending: withdrawing, isConfirming: withdrawingConfirming, isSuccess: withdrawSuccess, error: withdrawError } = useWithdrawFee();

  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase();

  const state = marketInfo ? marketInfo.state : -1;
  const isOpen = state === 0;
  const isResolved = state === 2;
  const isExpired = marketInfo && marketInfo.expiry > 0n && BigInt(Math.floor(Date.now() / 1000)) >= marketInfo.expiry;
  const canTrade = isOpen && !isExpired;
  const canResolve = (isOpen || state === 1) && isExpired && !isResolved;

  const winningBracket = marketInfo ? marketInfo.winningBracket : 0;
  const userWinStake = isResolved ? userStakes[winningBracket] : 0n;
  const canClaim = isResolved && userWinStake > 0n;

  useEffect(() => {
    if (stakeSuccess) { setTxMessage("Stake confirmed!"); setAmount(""); setSelectedBracket(null); setShowFaucetHint(false); refetch(); }
    if (resolveSuccess) { setTxMessage("Market resolved!"); refetch(); }
    if (claimSuccess) { setTxMessage("Winnings claimed!"); refetch(); }
    if (withdrawSuccess) { setTxMessage("Fee withdrawn!"); refetch(); }
  }, [stakeSuccess, resolveSuccess, claimSuccess, withdrawSuccess]);

  useEffect(() => {
    const err = stakeError || resolveError || claimError || withdrawError;
    if (err) {
      const msg = (err as any)?.shortMessage ?? err?.message ?? "Transaction failed";
      setTxMessage(`Error: ${msg}`);
      if (msg.toLowerCase().includes("insufficient") || msg.toLowerCase().includes("balance")) {
        setShowFaucetHint(true);
      }
    }
  }, [stakeError, resolveError, claimError, withdrawError]);

  const handleStake = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBracket === null || !amount || Number(amount) <= 0 || !marketId) return;
    setTxMessage(null);
    setShowFaucetHint(false);
    stake(marketId, selectedBracket, amount);
  };

  if (!marketInfo || marketInfo.expiry === 0n) {
    return (
      <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-4 text-sm text-[#64748b]">
        Loading market data…
      </div>
    );
  }

  return (
    <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-4 space-y-4">
      {isWrongNetwork && (
        <div className="flex items-center justify-between gap-3 border border-yellow-200 bg-yellow-50 rounded-lg px-3 py-2">
          <p className="text-xs text-yellow-800 font-medium">Wrong network — switch to RSK Testnet to interact.</p>
          <button
            type="button"
            onClick={() => switchChain({ chainId: RSK_TESTNET_CHAIN_ID })}
            disabled={isSwitching}
            className="shrink-0 bg-yellow-800 text-white text-xs px-2 py-1 rounded font-semibold disabled:opacity-50"
          >
            {isSwitching ? "Switching…" : "Switch"}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#0f172a]">
          {canTrade ? "Place Your Prediction" : "Market Activity"}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
          canTrade ? "bg-green-100 text-green-800" :
          isResolved ? "bg-purple-100 text-purple-800" :
          isExpired ? "bg-orange-100 text-orange-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {isExpired && !isResolved ? "Expired" : (MarketStateLabel[state] ?? "Unknown")}
        </span>
      </div>

      {canTrade && (
        <form onSubmit={handleStake} className="space-y-4">
          <p className="text-xs text-[#64748b]">
            Select the bracket you think BTC will land in and stake your tRBTC.
          </p>

          <div className="space-y-2">
            {([0, 1, 2] as const).map((b) => {
              const label = getBracketLabel(b, marketInfo.threshold1, marketInfo.threshold2);
              const total = bracketTotals[b];
              const userBracketStake = userStakes[b];
              const totalPool = marketInfo.totalPool;
              const pct = totalPool > 0n ? Math.round(Number((total * 100n) / totalPool)) : 0;
              const isSelected = selectedBracket === b;

              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBracket(isSelected ? null : b)}
                  className={`w-full text-left border rounded-xl p-3 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#6366f1] bg-[rgba(99,102,241,0.06)]"
                      : "border-[rgba(15,23,42,0.08)] bg-white hover:border-[rgba(99,102,241,0.4)] hover:bg-[rgba(99,102,241,0.02)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? "border-[#6366f1] bg-[#6366f1]" : "border-[rgba(15,23,42,0.2)]"
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm font-semibold ${isSelected ? "text-[#6366f1]" : "text-[#0f172a]"}`}>
                        {label}
                      </span>
                      {userBracketStake > 0n && (
                        <span className="text-xs text-[#6366f1]">
                          (your stake: {formatRbtc(userBracketStake)})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[rgba(15,23,42,0.06)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isSelected ? "bg-[#6366f1]" : "bg-[#6366f1]/50"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#94a3b8] shrink-0">{formatRbtc(total)} ({pct}%)</span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedBracket !== null && (
            <div className="bg-[rgba(99,102,241,0.04)] border border-[rgba(99,102,241,0.15)] rounded-lg p-3">
              <p className="text-xs text-[#6366f1] font-medium mb-2">
                Staking on: <strong>{getBracketLabel(selectedBracket, marketInfo.threshold1, marketInfo.threshold2)}</strong>
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0.000001"
                  step="0.000001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount in tRBTC"
                  className="flex-1 px-3 py-2 border border-[rgba(15,23,42,0.08)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                />
                <button
                  type="submit"
                  disabled={!isConnected || isWrongNetwork || !amount || Number(amount) <= 0 || staking || stakingConfirming}
                  className="shrink-0 px-4 py-2 bg-[#0f172a] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {staking || stakingConfirming ? "Confirming…" : "Stake"}
                </button>
              </div>
              {!isConnected && (
                <p className="text-xs text-[#64748b] mt-1">Connect your wallet to stake</p>
              )}

              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#94a3b8]">
                <span>Need testnet RBTC?</span>
                <a
                  href="https://faucet.rootstock.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium no-underline transition-colors"
                >
                  Get from faucet <ExternalLink size={11} />
                </a>
              </div>
            </div>
          )}

          {selectedBracket === null && (
            <p className="text-xs text-[#94a3b8] text-center">Select a bracket above to place your stake</p>
          )}
        </form>
      )}

      {showFaucetHint && (
        <div className="border border-orange-200 bg-orange-50 rounded-lg px-3 py-2">
          <p className="text-xs text-orange-800 font-medium mb-1">Looks like you might need testnet RBTC</p>
          <a
            href="https://faucet.rootstock.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold text-xs no-underline"
          >
            Get free tRBTC from faucet.rootstock.io <ExternalLink size={11} />
          </a>
        </div>
      )}

      {!canTrade && !isResolved && (
        <div className="text-sm text-[#64748b] py-2">
          {isExpired
            ? "This market has expired. Trigger resolution below to determine the winning bracket."
            : "This market is closed — staking is no longer available."}
        </div>
      )}

      {canResolve && (
        <div className="pt-2 border-t border-[rgba(15,23,42,0.08)]">
          <p className="text-xs text-[#64748b] mb-2">
            Market expired. Anyone can trigger resolution to lock in the final BTC price:
          </p>
          <button
            onClick={() => { setTxMessage(null); if (marketId) resolve(marketId); }}
            disabled={resolving || resolvingConfirming || isWrongNetwork}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50 text-sm"
          >
            {resolving || resolvingConfirming ? "Resolving…" : "Resolve Market"}
          </button>
        </div>
      )}

      {canClaim && (
        <div className="pt-2 border-t border-[rgba(15,23,42,0.08)]">
          <p className="text-xs text-[#64748b] mb-1">
            You staked in the winning bracket ({getBracketLabel(winningBracket, marketInfo.threshold1, marketInfo.threshold2)}).
          </p>
          <p className="text-sm font-medium text-green-700 mb-2">Your winning stake: {formatRbtc(userWinStake)}</p>
          <button
            onClick={() => { setTxMessage(null); if (marketId) claim(marketId); }}
            disabled={claiming || claimingConfirming || isWrongNetwork}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50 text-sm"
          >
            {claiming || claimingConfirming ? "Claiming…" : "Claim Winnings"}
          </button>
        </div>
      )}

      {isResolved && !canClaim && (
        <div className="pt-2 border-t border-[rgba(15,23,42,0.08)]">
          <p className="text-sm text-[#64748b]">
            Market resolved. Winning bracket:{" "}
            <strong>{getBracketLabel(winningBracket, marketInfo.threshold1, marketInfo.threshold2)}</strong>
          </p>
          {userStakes.every((s) => s === 0n) ? (
            <p className="text-xs text-[#64748b] mt-1">You had no stake in this market.</p>
          ) : (
            <p className="text-xs text-[#64748b] mt-1">Your bracket did not win this round.</p>
          )}
        </div>
      )}

      {isOwner && isResolved && (
        <div className="pt-2 border-t border-[rgba(15,23,42,0.08)]">
          <button
            onClick={() => { setTxMessage(null); withdrawFee(); }}
            disabled={withdrawing || withdrawingConfirming}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg font-semibold disabled:opacity-50 text-sm"
          >
            {withdrawing || withdrawingConfirming ? "Withdrawing…" : "Withdraw Protocol Fee (Owner)"}
          </button>
        </div>
      )}

      {txMessage && (
        <div className={`text-sm px-3 py-2 rounded-lg ${
          txMessage.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
        }`}>
          {txMessage}
        </div>
      )}
    </div>
  );
}

export default TradePanel;
