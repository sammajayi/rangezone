"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useRouter } from "next/navigation";
import { useCreateMarket, useContractOwner } from "../../hooks/useRangeZone";

const RSK_TESTNET_CHAIN_ID = 31;

const DURATION_OPTIONS = [
  { label: "1 hour", seconds: 3600 },
  { label: "6 hours", seconds: 21600 },
  { label: "12 hours", seconds: 43200 },
  { label: "1 day", seconds: 86400 },
  { label: "3 days", seconds: 259200 },
  { label: "7 days", seconds: 604800 },
];

export default function CreateMarketPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: owner } = useContractOwner();
  const { createMarket, isPending, isConfirming, isSuccess, error } = useCreateMarket();

  const isWrongNetwork = isConnected && chainId !== RSK_TESTNET_CHAIN_ID;
  const isOwner = isConnected && owner && address && owner.toLowerCase() === address.toLowerCase();

  const [currentStep, setCurrentStep] = useState(1);
  const [duration, setDuration] = useState(DURATION_OPTIONS[3].seconds);
  const [threshold1, setThreshold1] = useState("3");
  const [threshold2, setThreshold2] = useState("7");

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => router.push("/"), 2000);
    }
  }, [isSuccess]);

  const t1 = Number(threshold1);
  const t2 = Number(threshold2);
  const thresholdsValid = t1 > 0 && t2 > t1;

  function handleNext() {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  }
  function handleBack() {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!thresholdsValid) return;
    createMarket(duration, t1, t2);
  }

  const selectedDurationLabel = DURATION_OPTIONS.find((o) => o.seconds === duration)?.label ?? "Custom";

  if (!isConnected) {
    return (
      <main className="max-w-[720px] mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Create market</h1>
        <p className="text-[#64748b]">Connect your wallet to create a market.</p>
      </main>
    );
  }

  if (isConnected && owner && !isOwner) {
    return (
      <main className="max-w-[720px] mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Create market</h1>
        <p className="text-[#64748b]">Only the contract owner can create markets.</p>
        <p className="text-xs text-[#94a3b8] mt-2">Owner: {owner}</p>
        <p className="text-xs text-[#94a3b8]">Your address: {address}</p>
      </main>
    );
  }

  return (
    <main className="max-w-[720px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-1">Create market</h1>
      <p className="text-[#64748b] mb-6">Configure a new BTC magnitude prediction market on RSK Testnet.</p>

      {isWrongNetwork && (
        <div className="mb-6 flex items-center justify-between gap-4 border border-yellow-200 bg-yellow-50 rounded-lg px-4 py-3">
          <p className="text-sm text-yellow-800 font-medium">Your wallet is connected to the wrong network. Switch to RSK Testnet to continue.</p>
          <button
            type="button"
            onClick={() => switchChain({ chainId: RSK_TESTNET_CHAIN_ID })}
            disabled={isSwitching}
            className="shrink-0 bg-yellow-800 text-white text-sm px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
          >
            {isSwitching ? "Switching…" : "Switch Network"}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2].map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step ? "bg-[#0f172a] text-white" : "bg-[rgba(15,23,42,0.08)] text-[#64748b]"
                  }`}
                >
                  {step}
                </div>
              </div>
              {index < 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-colors ${
                    currentStep > step ? "bg-[#0f172a]" : "bg-[rgba(15,23,42,0.08)]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">

        {/* Step 1: Duration */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-1">Market Duration</h2>
            <p className="text-sm text-[#64748b] mb-4">
              How long should the market stay open for staking? The oracle will be read at expiry to determine the winner.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.seconds}
                  type="button"
                  onClick={() => setDuration(opt.seconds)}
                  className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                    duration === opt.seconds
                      ? "border-[#6366f1] bg-[rgba(99,102,241,0.06)] text-[#0f172a]"
                      : "border-[rgba(15,23,42,0.12)] text-[#0f172a] hover:bg-[rgba(15,23,42,0.03)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#0f172a] text-white px-4 py-2 rounded-lg font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Thresholds + Confirm */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-1">Price Movement Brackets</h2>
            <p className="text-sm text-[#64748b] mb-4">
              Define the bracket boundaries for the magnitude of BTC price movement.
              Bracket 0 = below threshold 1, Bracket 1 = between, Bracket 2 = above threshold 2.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="threshold1">
                  Threshold 1 (%) — lower bound
                </label>
                <input
                  id="threshold1"
                  type="number"
                  min="1"
                  max="99"
                  value={threshold1}
                  onChange={(e) => setThreshold1(e.target.value)}
                  required
                  className="w-full border border-[rgba(15,23,42,0.12)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#6366f1]"
                  placeholder="e.g. 3"
                />
                <p className="text-xs text-[#94a3b8] mt-1">Bracket 0: price moves &lt; {threshold1 || "?"}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="threshold2">
                  Threshold 2 (%) — upper bound
                </label>
                <input
                  id="threshold2"
                  type="number"
                  min="2"
                  max="100"
                  value={threshold2}
                  onChange={(e) => setThreshold2(e.target.value)}
                  required
                  className="w-full border border-[rgba(15,23,42,0.12)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#6366f1]"
                  placeholder="e.g. 7"
                />
                <p className="text-xs text-[#94a3b8] mt-1">
                  Bracket 1: {threshold1 || "?"}%–{threshold2 || "?"}% | Bracket 2: &gt;{threshold2 || "?"}%
                </p>
              </div>
            </div>

            {!thresholdsValid && threshold1 && threshold2 && (
              <p className="text-sm text-red-600">Threshold 2 must be greater than Threshold 1, and both must be positive.</p>
            )}

            {/* Summary */}
            <div className="bg-[rgba(15,23,42,0.03)] rounded-lg p-4 text-sm space-y-1">
              <p className="font-semibold text-[#0f172a] mb-2">Market Summary</p>
              <p className="text-[#64748b]">Duration: <strong>{selectedDurationLabel}</strong></p>
              <p className="text-[#64748b]">Bracket 0: price moves &lt; {threshold1}%</p>
              <p className="text-[#64748b]">Bracket 1: price moves {threshold1}% – {threshold2}%</p>
              <p className="text-[#64748b]">Bracket 2: price moves &gt; {threshold2}%</p>
              <p className="text-[#64748b] text-xs mt-2">Network: RSK Testnet · Contract: 0x7368…D7</p>
            </div>

            {isSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
                Market created successfully! Redirecting…
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {(error as any)?.shortMessage ?? error?.message ?? "Transaction failed"}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={isPending || isConfirming}
                className="border border-[rgba(15,23,42,0.12)] text-[#0f172a] px-4 py-2 rounded-lg font-semibold hover:bg-[rgba(15,23,42,0.04)] disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!thresholdsValid || isPending || isConfirming || isSuccess || isWrongNetwork}
                className="bg-[#0f172a] text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isConfirming ? "Creating…" : "Create Market"}
              </button>
            </div>
          </div>
        )}
      </form>
    </main>
  );
}
