"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useRouter } from "next/navigation";
import { useCreateMarket, useContractOwner, useMarketCount } from "../../hooks/useRangeZone";
import { ImagePlus, X } from "lucide-react";

const RSK_TESTNET_CHAIN_ID = 31;

const DURATION_OPTIONS = [
  { label: "5 minutes", seconds: 300 },
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
  const { data: owner, isLoading: ownerLoading } = useContractOwner();
  const { data: marketCount } = useMarketCount();
  const { createMarket, isPending, isConfirming, isSuccess, error } = useCreateMarket();

  const isWrongNetwork = isConnected && chainId !== RSK_TESTNET_CHAIN_ID;
  const isOwner = isConnected && owner && address && owner.toLowerCase() === address.toLowerCase();
  const isOwnerCheckPending = isConnected && !owner && ownerLoading;

  const [currentStep, setCurrentStep] = useState(1);
  const [duration, setDuration] = useState(DURATION_OPTIONS[3].seconds);
  const [threshold1, setThreshold1] = useState("3");
  const [threshold2, setThreshold2] = useState("7");
  const [question, setQuestion] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSuccess) {
      const newId = (Number(marketCount ?? 0n) + 1).toString();
      if (question.trim()) {
        localStorage.setItem(`market_question_${newId}`, question.trim());
      }
      if (imageDataUrl) {
        localStorage.setItem(`market_image_${newId}`, imageDataUrl);
      }
      setTimeout(() => router.push("/"), 2000);
    }
  }, [isSuccess]);

  const t1 = Number(threshold1);
  const t2 = Number(threshold2);
  const thresholdsValid = t1 > 0 && t2 > t1;

  function handleNext() {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  }
  function handleBack() {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!thresholdsValid) return;
    console.log("Submitting createMarket with:", {
      duration: DURATION_OPTIONS.find(o => o.seconds === duration)?.label,
      threshold1: t1,
      threshold2: t2,
      isOwner,
      address,
    });
    createMarket(duration, t1, t2);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageDataUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  const selectedDurationLabel = DURATION_OPTIONS.find((o) => o.seconds === duration)?.label ?? "Custom";

  if (!isConnected) {
    return (
      <main className="max-w-180 mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Create market</h1>
        <p className="text-[#64748b]">Connect your wallet to create a market.</p>
      </main>
    );
  }

  if (isConnected && owner && !isOwner) {
    return (
      <main className="max-w-180 mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Create market</h1>
        <p className="text-[#64748b]">Only the contract owner can create markets.</p>
      </main>
    );
  }

  return (
    <main className="max-w-180 mx-auto px-4 py-8">
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
          {[1, 2, 3].map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= step ? "bg-[#0f172a] text-white" : "bg-[rgba(15,23,42,0.08)] text-[#64748b]"
                  }`}
                >
                  {step}
                </div>
                <span className="text-xs text-[#64748b] mt-1">
                  {step === 1 ? "Duration" : step === 2 ? "Brackets" : "Question"}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`h-1 flex-1 mx-2 mb-4 transition-colors ${
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
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Thresholds */}
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

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="border border-[rgba(15,23,42,0.12)] text-[#0f172a] px-4 py-2 rounded-lg font-semibold hover:bg-[rgba(15,23,42,0.04)]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!thresholdsValid}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Question + Image + Confirm */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-1">Market Question & Image</h2>
            <p className="text-sm text-[#64748b] mb-4">
              Write a clear question that describes what this market is predicting. Optionally add a cover image (128×128).
            </p>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="question">
                Market question <span className="text-[#94a3b8] font-normal">(optional)</span>
              </label>
              <input
                id="question"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`e.g. Will BTC be between ${threshold1}% and ${threshold2}% by ${selectedDurationLabel} from now?`}
                className="w-full border border-[rgba(15,23,42,0.12)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#6366f1] text-sm"
                maxLength={120}
              />
              <p className="text-xs text-[#94a3b8] mt-1">{question.length}/120 characters</p>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Market image (optional)</label>
              {imageDataUrl ? (
                <div className="flex items-center gap-4">
                  <img
                    src={imageDataUrl}
                    alt="Market preview"
                    className="w-32 h-32 rounded-xl object-cover border border-[rgba(15,23,42,0.12)]"
                  />
                  <button
                    type="button"
                    onClick={() => { setImageDataUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    <X size={14} /> Remove image
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 border-2 border-dashed border-[rgba(15,23,42,0.12)] rounded-xl px-5 py-4 text-sm text-[#64748b] hover:border-[#6366f1] hover:text-[#6366f1] transition-colors"
                >
                  <ImagePlus size={18} />
                  Upload image (PNG, JPG, GIF — displayed at 128×128)
                </button>
              )}
              <input
              title="file"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Summary */}
            <div className="bg-[rgba(15,23,42,0.03)] rounded-lg p-4 text-sm space-y-1">
              <p className="font-semibold text-[#0f172a] mb-2">Market Summary</p>
              <p className="text-[#64748b]">Question: <strong>{question || "—"}</strong></p>
              <p className="text-[#64748b]">Duration: <strong>{selectedDurationLabel}</strong></p>
              <p className="text-[#64748b]">Bracket 0: price moves &lt; {threshold1}%</p>
              <p className="text-[#64748b]">Bracket 1: price moves {threshold1}% – {threshold2}%</p>
              <p className="text-[#64748b]">Bracket 2: price moves &gt; {threshold2}%</p>
            </div>

            {isSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
                Market created successfully! Redirecting…
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">Transaction failed</p>
                <p className="text-xs mb-2">{(error as any)?.shortMessage ?? error?.message ?? "Unknown error occurred"}</p>

                {error?.message?.includes("Price too old") && (
                  <div className="text-xs mt-2 p-2 bg-red-100 rounded">
                    <p className="font-semibold">Price feed is too old</p>
                    <p>The oracle price must be less than 24 hours old. This is a temporary issue with the price feed.</p>
                  </div>
                )}

                {error?.message?.includes("Invalid price") && (
                  <div className="text-xs mt-2 p-2 bg-red-100 rounded">
                    <p className="font-semibold">Invalid price from oracle</p>
                    <p>The price feed returned an invalid price. Please try again.</p>
                  </div>
                )}

                {error?.message?.includes("Only owner") && (
                  <div className="text-xs mt-2 p-2 bg-red-100 rounded">
                    <p className="font-semibold">Only the contract owner can create markets</p>
                  </div>
                )}

                {!error?.message?.includes("Price") && !error?.message?.includes("owner") && (
                  <div className="text-xs mt-2 p-2 bg-red-100 rounded">
                    <p>Check the browser console (F12) for more details</p>
                  </div>
                )}
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
                disabled={!thresholdsValid || isPending || isConfirming || isSuccess || isWrongNetwork || isOwnerCheckPending || !isOwner}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isOwnerCheckPending ? "Checking ownership…" : isPending || isConfirming ? "Creating…" : "Create Market"}
              </button>
            </div>
          </div>
        )}
      </form>
    </main>
  );
}
