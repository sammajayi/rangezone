"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useStakedEvents } from "../hooks/useRangeZone";
import { getBracketLabel } from "../lib/rangeZoneContract";

interface ChartProps {
  marketId: bigint | undefined;
  threshold1: bigint;
  threshold2: bigint;
  userAddress?: string;
}

const BRACKET_COLORS = ["#6366f1", "#f59e0b", "#10b981"];
const USER_COLORS = ["#a5b4fc", "#fcd34d", "#6ee7b7"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[rgba(15,23,42,0.08)] rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-[#0f172a] mb-1">Stake #{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {entry.value.toFixed(6)} tRBTC
        </p>
      ))}
    </div>
  );
};

const Chart: React.FC<ChartProps> = ({ marketId, threshold1, threshold2, userAddress }) => {
  const { points, isLoading } = useStakedEvents(marketId, userAddress);

  const labels = [
    getBracketLabel(0, threshold1, threshold2),
    getBracketLabel(1, threshold1, threshold2),
    getBracketLabel(2, threshold1, threshold2),
  ];

  const hasUserStakes = !!userAddress && points.some((p) => p.u0 > 0 || p.u1 > 0 || p.u2 > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-[#64748b]">
        Loading staking history…
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-sm text-[#64748b] space-y-1">
        <p className="font-medium text-[#0f172a]">No stakes yet</p>
        <p>The chart will update as users stake on this market.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748b] mb-1">
        <span className="flex items-center gap-1">
          <span className="w-4 h-0.5 bg-[#6366f1] inline-block rounded" />
          All stakers (cumulative)
        </span>
        {hasUserStakes && (
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 bg-[#a5b4fc] inline-block rounded" style={{ borderTop: "2px dashed #a5b4fc", height: 0 }} />
            Your stakes
          </span>
        )}
      </div>
      <div style={{ height: "280px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v.toFixed(3)}`}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              formatter={(value) => <span style={{ color: "#0f172a" }}>{value}</span>}
            />

            {([0, 1, 2] as const).map((b) => (
              <Line
                key={`b${b}`}
                type="monotone"
                dataKey={`b${b}`}
                name={labels[b]}
                stroke={BRACKET_COLORS[b]}
                strokeWidth={2}
                dot={{ r: 3, fill: BRACKET_COLORS[b] }}
                activeDot={{ r: 5 }}
              />
            ))}

            {hasUserStakes && ([0, 1, 2] as const).map((b) => (
              <Line
                key={`u${b}`}
                type="monotone"
                dataKey={`u${b}`}
                name={`Yours: ${labels[b]}`}
                stroke={USER_COLORS[b]}
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;
