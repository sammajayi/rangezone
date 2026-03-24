import React, { useState } from 'react';

interface TradePanelProps {
  marketId: string;
  onTrade: (side: 'yes' | 'no', amount: number) => void;
}

export const TradePanel: React.FC<TradePanelProps> = ({ marketId, onTrade }) => {
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState<number | ''>('');

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    onTrade(side, amt);
    setAmount('');
  };

  return (
    <div className="border border-[rgba(15,23,42,0.08)] rounded-xl p-4 space-y-4">
      <h3 className="text-lg font-semibold text-[#0f172a]">Trade</h3>
      <p className="text-sm text-[#64748b]">Market: {marketId}</p>

      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSide('yes')}
            className={`flex-1 px-3 py-2 rounded-md font-semibold ${side === 'yes' ? 'bg-[rgba(16,185,129,0.12)] text-[#065f46]' : 'bg-transparent text-[#0f172a] border border-[rgba(15,23,42,0.04)]'}`}
          >
            Buy (Yes)
          </button>
          <button
            type="button"
            onClick={() => setSide('no')}
            className={`flex-1 px-3 py-2 rounded-md font-semibold ${side === 'no' ? 'bg-[rgba(239,68,68,0.12)] text-[#ef4444]' : 'bg-transparent text-[#0f172a] border border-[rgba(15,23,42,0.04)]'}`}
          >
            Buy (No)
          </button>
        </div>

        <input
          type="number"
          min="0"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Amount"
          className="w-full px-3 py-2 border border-[rgba(15,23,42,0.08)] rounded-md focus:outline-none"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-[#0f172a] text-white rounded-lg hover:bg-[#0b1324] transition-colors"
          >
            Place Trade
          </button>
          <button
            type="button"
            onClick={() => { setAmount(''); setSide('yes'); }}
            className="px-4 py-2 border border-[rgba(15,23,42,0.08)] rounded-lg"
          >
            Reset
          </button>
        </div>
      </form>

      <p className="text-xs text-[#64748b]">This is a mock trade UI — trades update the chart and market locally.</p>
    </div>
  );
};

export default TradePanel;