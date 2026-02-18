"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

interface PortfolioChartProps {
  holdings: { symbol: string; value: number }[];
  cashBalance: number;
}

export function PortfolioChart({ holdings, cashBalance }: PortfolioChartProps) {
  const data = [
    ...holdings.map((h) => ({ name: h.symbol, value: Math.round(h.value * 100) / 100 })),
    { name: "Cash", value: Math.round(cashBalance * 100) / 100 },
  ];

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="h-[200px] w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
                return (
                  <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">{d.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      ${d.value.toFixed(2)} ({pct}%)
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {d.name}{" "}
              <span className="font-semibold text-zinc-900 dark:text-white">
                {total > 0 ? ((d.value / total) * 100).toFixed(1) : "0"}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
