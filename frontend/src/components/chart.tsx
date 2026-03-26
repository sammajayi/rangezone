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
  ReferenceLine,
} from "recharts";
import { useStakedEvents } from "../hooks/useRangeZone";
import { getBracketLabel } from "../lib/rangeZoneContract";

interface ChartProps {
  marketId: bigint | undefined;
  threshold1: bigint;
  threshold2: bigint;
}

const BRACKET_COLORS = ["#6366f1", "#f59e0b", "#10b981"];

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

const Chart: React.FC<ChartProps> = ({ marketId, threshold1, threshold2 }) => {
  const { points, isLoading } = useStakedEvents(marketId);

  const labels = [
    getBracketLabel(0, threshold1, threshold2),
    getBracketLabel(1, threshold1, threshold2),
    getBracketLabel(2, threshold1, threshold2),
  ];

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
    <div className="w-full" style={{ height: "280px" }}>
      <p className="text-xs text-[#64748b] mb-2 font-medium">
        Cumulative stakes per bracket over time (tRBTC)
      </p>
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
            wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            formatter={(value) => (
              <span style={{ color: "#0f172a" }}>{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="b0"
            name={labels[0]}
            stroke={BRACKET_COLORS[0]}
            strokeWidth={2}
            dot={{ r: 3, fill: BRACKET_COLORS[0] }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="b1"
            name={labels[1]}
            stroke={BRACKET_COLORS[1]}
            strokeWidth={2}
            dot={{ r: 3, fill: BRACKET_COLORS[1] }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="b2"
            name={labels[2]}
            stroke={BRACKET_COLORS[2]}
            strokeWidth={2}
            dot={{ r: 3, fill: BRACKET_COLORS[2] }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
