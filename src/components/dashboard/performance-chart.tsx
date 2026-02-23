"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PerformanceChartProps {
  snapshots: { date: string; value: number }[];
}

export function PerformanceChart({ snapshots }: PerformanceChartProps) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={snapshots} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + (v >= 1000 ? (v / 1000).toFixed(1) + "k" : v)} width={40} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{d.date}</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">${d.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
              );
            }}
          />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
