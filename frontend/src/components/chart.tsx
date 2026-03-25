import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DataItem {
  name: string;
  uv: number; 
  pv: number; 
  amt: number;
}

const rawValues = [
  { uv: 4000, pv: 2400 },
  { uv: 3000, pv: 1398 },
  { uv: 2000, pv: 9800 },
  { uv: 2780, pv: 3908 },
  { uv: 1890, pv: 4800 },
  { uv: 2390, pv: 3800 },
  { uv: 3490, pv: 4300 },
];

const initialData: DataItem[] = rawValues.map((r, i) => {
  const ts = new Date(Date.now() - (rawValues.length - 1 - i) * 60000); 
  const total = r.uv + r.pv;
  const uvPct = Math.round((r.uv / total) * 100);
  const pvPct = 100 - uvPct;
  return {
    name: ts.toLocaleTimeString(),
    uv: uvPct,
    pv: pvPct,
    amt: 0,
  };
});

type VoteType = 'yes' | 'no' | null;

interface ChartProps {
  lastVote?: VoteType;
  tradeEvent?: { side: 'yes' | 'no'; amount: number } | null;
}

const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

const Example: React.FC<ChartProps> = ({ lastVote = null, tradeEvent = null }) => {
  const [data, setData] = useState<DataItem[]>(initialData);

  useEffect(() => {
    if (!lastVote && !tradeEvent) return;

    setData((prev) => {
      const last = prev[prev.length - 1];
      const baseUv = last?.uv ?? 50;
      const basePv = last?.pv ?? 50;

    
      const voteDelta =
        lastVote === 'yes'
          ? Math.max(1, Math.round((100 - baseUv) * 0.04))
          : lastVote === 'no'
          ? Math.max(1, Math.round((100 - basePv) * 0.04))
          : 0;

      // scale trade amount to a percentage delta (log scale + cap)
      const scaleTrade = (amt = 0) => {
        if (!amt || amt <= 0) return 0;
        const delta = Math.round(Math.log1p(Math.abs(amt)) * 3); // gentle growth
        return Math.min(20, delta); // cap per-event impact
      };

      const tradeDeltaYes = tradeEvent?.side === 'yes' ? scaleTrade(tradeEvent.amount) : 0;
      const tradeDeltaNo = tradeEvent?.side === 'no' ? scaleTrade(tradeEvent.amount) : 0;

      // compute raw new values (before normalization)
      let newUv = baseUv + (lastVote === 'yes' ? voteDelta : 0) + tradeDeltaYes;
      let newPv = basePv + (lastVote === 'no' ? voteDelta : 0) + tradeDeltaNo;

      // clamp
      newUv = clamp(newUv);
      newPv = clamp(newPv);

      // normalize so they sum to 100 (avoid drift)
      const total = newUv + newPv;
      if (total === 0) {
        newUv = 50;
        newPv = 50;
      } else {
        newUv = Math.round((newUv / total) * 100);
        newPv = 100 - newUv;
      }

      // apply light smoothing to avoid harsh jumps (blend last and new)
      const smoothUv = Math.round(last ? last.uv * 0.6 + newUv * 0.4 : newUv);
      const smoothPv = 100 - smoothUv;

      const newPoint: DataItem = {
        name: new Date().toLocaleTimeString(),
        uv: smoothUv,
        pv: smoothPv,
        amt: last?.amt ?? 0,
      };

      const next = [...prev, newPoint].slice(-10); // keep last 10 points
      return next;
    });
  }, [lastVote, tradeEvent]);

  return (
    <div style={{ width: '100%', maxWidth: '700px', height: '40vh' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 8,
            right: 8,
            left: 0,
            bottom: 8,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tickFormatter={(v: string) => {
              // show hh:mm
              try {
                const d = new Date();
                const parts = v.split(':');
            
                const len = parts.length;
                return parts.slice(len - 2).join(':');
              } catch {
                return v;
              }
            }}
            minTickGap={20}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip formatter={(value) => value !== undefined ? `${value}%` : ''} />
          <Legend />
          <Line
            type="monotone"
            dataKey="pv"
            stroke="#ff6b6b"
            name="No"
            dot={false}
            isAnimationActive={true}
            animationDuration={600}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="uv"
            stroke="#2dd4bf"
            name="Yes"
            dot={false}
            isAnimationActive={true}
            animationDuration={600}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Example;
