"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import {
  useCurrentMarket,
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

export function TradePanel() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const isWrongNetwork = isConnected && chainId !== RSK_TESTNET_CHAIN_ID;

  const { data: currentMarket, refetch } = useCurrentMarket();
  const { data: owner } = useContractOwner();

  const marketId = currentMarket ? currentMarket[0] : undefined;
  const marketInfo = currentMarket ? currentMarket[1] : undefined;

  const bracketTotals = useBracketTotals(marketId);
  const userStakes = useUserStakes(marketId, address);

  const [selectedBracket, setSelectedBracket] = useState<0 | 1 | 2>(0);
  const [amount, setAmount] = useState("");
  const [txMessage, setTxMessage] = useState<string | null>(null);

  const { stake, isPending: staking, isConfirming: stakingConfirming, isSuccess: stakeSuccess, error: stakeError } = useStake();
  const { resolve, isPending: resolving, isConfirming: resolvingConfirming, isSuccess: resolveSuccess, error: resolveError } = useResolve();
  const { claim, isPending: claiming, isConfirming: claimingConfirming, isSuccess: claimSuccess, error: claimError } = useClaim();
  const { withdrawFee, isPending: withdrawing, isConfirming: withdrawingConfirming, isSuccess: withdrawSuccess, error: withdrawError } = useWithdrawFee();

  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase();

  const state = marketInfo ? Number(marketInfo.state) : -1;
  const isOpen = state === 0;
  const isResolved = state === 2;
  const isExpired = marketInfo && marketInfo.expiry > 0n && BigInt(Math.floor(Date.now() / 1000)) >= marketInfo.expiry;
  const canResolve = isOpen && isExpired;

  const winningBracket = marketInfo ? marketInfo.winningBracket : 0;
  const userWinStake = isResolved ? userStakes[winningBracket] : 0n;
  const canClaim = isResolved && userWinStake > 0n;

  useEffect(() => {
    if (stakeSuccess) { setTxMessage("Stake confirmed!"); setAmount(""); refetch(); }
    if (resolveSuccess) { setTxMessage("Market resolved!"); refetch(); }
    if (claimSuccess) { setTxMessage("Winnings claimed!"); refetch(); }
    if (withdrawSuccess) { setTxMessage("Fee withdrawn!"); refetch(); }
  }, [stakeSuccess, resolveSuccess, claimSuccess, withdrawSuccess]);

  useEffect(() => {
    const err = stakeError || resolveError || claimError || withdrawError;
    if (err) setTxMessage(`Error: ${(err as any)?.shortMessage ?? err?.message ?? "Transaction failed"}`);
  }, [stakeError, resolveError, claimError, withdrawError]);

  const handleStake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !marketId) return;
    setTxMessage(null);
    stake(marketId, selectedBracket, amount);
  };

  if (!marketInfo || marketInfo.expiry === 0n) {
    return (
      <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-4 text-sm text-[#64748b]">
        No active market. The contract owner can create one from the create page.
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
        <h3 className="text-lg font-semibold text-[#0f172a]">Stake RBTC</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
          isOpen ? "bg-green-100 text-green-800" :
          isResolved ? "bg-purple-100 text-purple-800" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {MarketStateLabel[state]}
        </span>
      </div>

      {isOpen && (
        <form onSubmit={handleStake} className="space-y-3">
          <p className="text-xs text-[#64748b]">Will BTC price move by this amount before expiry?</p>

          <div className="divide-y divide-[rgba(15,23,42,0.06)] border border-[rgba(15,23,42,0.08)] rounded-lg overflow-hidden">
            {([0, 1, 2] as const).map((b) => {
              const label = getBracketLabel(b, marketInfo.threshold1, marketInfo.threshold2);
              const total = bracketTotals[b];
              const userBracketStake = userStakes[b];
              const isSelected = selectedBracket === b;
              return (
                <div key={b} className="flex items-center justify-between px-3 py-2.5 text-sm bg-white">
                  <div>
                    <span className="font-medium text-[#0f172a]">{label}</span>
                    <span className="ml-2 text-[#94a3b8] text-xs">Pool: {formatRbtc(total)}</span>
                    {userBracketStake > 0n && (
                      <span className="ml-1 text-[#6366f1] text-xs">(yours: {formatRbtc(userBracketStake)})</span>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedBracket(b)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        isSelected
                          ? "bg-green-500 text-white"
                          : "bg-[rgba(15,23,42,0.06)] text-[#64748b] hover:bg-green-100 hover:text-green-700"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (isSelected) setSelectedBracket(b === 0 ? 1 : 0); }}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        !isSelected
                          ? "bg-red-100 text-red-600"
                          : "bg-[rgba(15,23,42,0.06)] text-[#64748b] hover:bg-red-100 hover:text-red-600"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

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
          </div>

          <button
            type="submit"
            disabled={!isConnected || isWrongNetwork || !amount || Number(amount) <= 0 || staking || stakingConfirming}
            className="w-full px-4 py-2 bg-[#0f172a] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {staking || stakingConfirming ? "Confirming…" : `Stake — ${getBracketLabel(selectedBracket, marketInfo.threshold1, marketInfo.threshold2)}`}
          </button>

          {!isConnected && (
            <p className="text-xs text-[#64748b] text-center">Connect your wallet to stake</p>
          )}
        </form>
      )}

      {canResolve && (
        <div className="pt-2 border-t border-[rgba(15,23,42,0.08)]">
          <p className="text-xs text-[#64748b] mb-2">Market has expired. Anyone can trigger resolution:</p>
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
          <p className="text-sm font-medium text-green-700 mb-2">Your stake: {formatRbtc(userWinStake)}</p>
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
            Market resolved. Winning bracket: <strong>{getBracketLabel(winningBracket, marketInfo.threshold1, marketInfo.threshold2)}</strong>
          </p>
          {userStakes.every((s) => s === 0n) && (
            <p className="text-xs text-[#64748b] mt-1">You had no stake in this market.</p>
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
