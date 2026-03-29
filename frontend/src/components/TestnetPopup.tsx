"use client";

import { useEffect, useState } from "react";
import { ExternalLink, X, Droplets } from "lucide-react";

const STORAGE_KEY = "rangezone_testnet_seen";

export function TestnetPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#0f172a] transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <Droplets size={20} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0f172a]">You're on Testnet</h2>
            <p className="text-xs text-orange-600 font-medium">RSK Testnet — no real funds involved</p>
          </div>
        </div>

        <p className="text-sm text-[#475569] mb-4 leading-relaxed">
          RangeZone is currently live on <strong>RSK Testnet</strong>. To stake and participate
          in markets you'll need testnet RBTC (tRBTC), which is free to claim from the faucet.
        </p>

        <a
          href="https://faucet.rootstock.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors no-underline mb-3 text-sm"
        >
          Get free testnet RBTC
          <ExternalLink size={14} />
        </a>

        <button
          onClick={dismiss}
          className="w-full text-sm text-[#64748b] hover:text-[#0f172a] transition-colors py-1"
        >
          I already have tRBTC, continue
        </button>
      </div>
    </div>
  );
}
