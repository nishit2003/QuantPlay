"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceArea,
} from "recharts";

interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartPoint extends HistoryPoint {
  idx: number;
  sma20?: number;
  sma50?: number;
  candleBody: [number, number];
}

const RANGES = ["1D", "5D", "1M", "3M", "1Y", "5Y"] as const;
type Range = (typeof RANGES)[number];
type ChartMode = "line" | "candle";

const RANGE_API_MAP: Record<Range, string> = {
  "1D": "1d",
  "5D": "5d",
  "1M": "1mo",
  "3M": "3mo",
  "1Y": "1y",
  "5Y": "5y",
};

function computeSMA(data: HistoryPoint[], period: number): (number | undefined)[] {
  return data.map((_, i) => {
    if (i < period - 1) return undefined;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
    return sum / period;
  });
}

function formatDate(dateStr: string, range: Range): string {
  const d = new Date(dateStr);
  if (range === "1D") return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (range === "5D") return d.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
  if (range === "1M" || range === "3M") return d.toLocaleDateString([], { month: "short", day: "numeric" });
  return d.toLocaleDateString([], { month: "short", year: "2-digit" });
}

function formatPrice(val: number): string {
  return `$${val.toFixed(2)}`;
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return (vol / 1e9).toFixed(1) + "B";
  if (vol >= 1e6) return (vol / 1e6).toFixed(1) + "M";
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + "K";
  return vol.toString();
}

// Custom candlestick shape: draws the wick (thin line) and body (rect) centered on the same x position
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CandlestickShape(props: any) {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  const { open, close, high, low } = payload as ChartPoint;
  const bullish = close >= open;
  const fill = bullish ? "#10b981" : "#ef4444";

  const yAxis = props.yAxis;
  if (!yAxis) return null;

  const scale = yAxis.scale;
  const yHigh = scale(high);
  const yLow = scale(low);

  const bodyX = x;
  const bodyW = Math.max(width, 2);
  const bodyY = y;
  const bodyH = Math.max(Math.abs(height), 1);
  const wickX = bodyX + bodyW / 2;

  return (
    <g>
      {/* Wick */}
      <line x1={wickX} x2={wickX} y1={yHigh} y2={yLow} stroke={fill} strokeWidth={1} />
      {/* Body */}
      <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} fill={fill} rx={1} />
    </g>
  );
}

interface StockChartProps {
  symbol: string;
  currentPrice?: number;
}

export function StockChart({ symbol, currentPrice }: StockChartProps) {
  const [range, setRange] = useState<Range>("1M");
  const [rawData, setRawData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [chartMode, setChartMode] = useState<ChartMode>("line");
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  // Zoom state
  const [zoomLeft, setZoomLeft] = useState<string | null>(null);
  const [zoomRight, setZoomRight] = useState<string | null>(null);
  const [dataSlice, setDataSlice] = useState<[number, number] | null>(null);
  const isSelecting = useRef(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setDataSlice(null);
    try {
      const res = await fetch(`/api/market/history?symbol=${symbol}&range=${RANGE_API_MAP[range]}`);
      const json = await res.json();
      setRawData(json.history ?? []);
    } catch {
      setRawData([]);
    } finally {
      setLoading(false);
    }
  }, [symbol, range]);

  useEffect(() => {
    if (symbol) fetchHistory();
  }, [symbol, fetchHistory]);

  const fullChartData: ChartPoint[] = useMemo(() => {
    if (rawData.length === 0) return [];
    const sma20 = computeSMA(rawData, 20);
    const sma50 = computeSMA(rawData, 50);
    return rawData.map((p, i) => ({
      ...p,
      idx: i,
      sma20: sma20[i],
      sma50: sma50[i],
      candleBody: [p.open, p.close] as [number, number],
    }));
  }, [rawData]);

  const chartData = useMemo(() => {
    if (!dataSlice) return fullChartData;
    return fullChartData.slice(dataSlice[0], dataSlice[1] + 1);
  }, [fullChartData, dataSlice]);

  const isZoomed = dataSlice !== null;

  // Zoom handlers
  function handleMouseDown(e: { activeLabel?: string }) {
    if (e?.activeLabel) {
      isSelecting.current = true;
      setZoomLeft(e.activeLabel);
      setZoomRight(null);
    }
  }

  function handleMouseMove(e: { activeLabel?: string }) {
    if (isSelecting.current && e?.activeLabel) {
      setZoomRight(e.activeLabel);
    }
    // Update hover price
    const payload = (e as Record<string, unknown>)?.activePayload as Array<{ payload: { close: number } }> | undefined;
    if (payload?.[0]) setHoverPrice(payload[0].payload.close);
  }

  function handleMouseUp() {
    if (!isSelecting.current || !zoomLeft || !zoomRight) {
      isSelecting.current = false;
      setZoomLeft(null);
      setZoomRight(null);
      return;
    }
    isSelecting.current = false;

    let leftIdx = fullChartData.findIndex((d) => d.date === zoomLeft);
    let rightIdx = fullChartData.findIndex((d) => d.date === zoomRight);
    if (leftIdx < 0 || rightIdx < 0) {
      setZoomLeft(null);
      setZoomRight(null);
      return;
    }
    if (leftIdx > rightIdx) [leftIdx, rightIdx] = [rightIdx, leftIdx];

    if (rightIdx - leftIdx < 3) {
      setZoomLeft(null);
      setZoomRight(null);
      return;
    }

    if (dataSlice) {
      setDataSlice([dataSlice[0] + leftIdx, dataSlice[0] + rightIdx]);
    } else {
      setDataSlice([leftIdx, rightIdx]);
    }
    setZoomLeft(null);
    setZoomRight(null);
  }

  function resetZoom() {
    setDataSlice(null);
  }

  const firstClose = chartData.length > 0 ? chartData[0].close : 0;
  const lastClose = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
  const displayPrice = hoverPrice ?? currentPrice ?? lastClose;
  const chartChange = displayPrice - firstClose;
  const chartChangePercent = firstClose > 0 ? (chartChange / firstClose) * 100 : 0;
  const isPositive = chartChange >= 0;

  const gradientColor = isPositive ? "#10b981" : "#ef4444";
  const strokeColor = isPositive ? "#10b981" : "#ef4444";

  const allPrices = chartData.flatMap((d) => [d.low, d.high, d.close]);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
  const pricePad = (maxPrice - minPrice) * 0.05 || 1;

  const maxVol = chartData.length > 0 ? Math.max(...chartData.map((d) => d.volume)) : 0;

  const candleBarSize = chartData.length > 0 ? Math.max(2, Math.min(12, Math.floor(600 / chartData.length) - 1)) : 4;

  return (
    <div className="w-full">
      {/* Price header */}
      <div className="mb-3">
        <div className="text-3xl font-bold text-zinc-900 dark:text-white">
          {formatPrice(displayPrice)}
        </div>
        <div className={`text-sm font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{chartChange.toFixed(2)} ({isPositive ? "+" : ""}{chartChangePercent.toFixed(2)}%)
          <span className="ml-2 text-zinc-400 font-normal">
            {range === "1D" ? "Today" : `Past ${range}`}
          </span>
        </div>
      </div>

      {/* Chart controls */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div className="flex rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800">
          <button
            onClick={() => setChartMode("line")}
            className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
              chartMode === "line" ? "bg-white shadow-sm text-zinc-900 dark:bg-zinc-700 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartMode("candle")}
            className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
              chartMode === "candle" ? "bg-white shadow-sm text-zinc-900 dark:bg-zinc-700 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Candle
          </button>
        </div>
        <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer">
          <input type="checkbox" checked={showVolume} onChange={(e) => setShowVolume(e.target.checked)} className="h-3 w-3 rounded accent-emerald-500" />
          Vol
        </label>
        <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer">
          <input type="checkbox" checked={showSMA20} onChange={(e) => setShowSMA20(e.target.checked)} className="h-3 w-3 rounded accent-blue-500" />
          SMA 20
        </label>
        <label className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer">
          <input type="checkbox" checked={showSMA50} onChange={(e) => setShowSMA50(e.target.checked)} className="h-3 w-3 rounded accent-orange-500" />
          SMA 50
        </label>
        {isZoomed && (
          <button onClick={resetZoom}
            className="ml-auto flex items-center gap-1 rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
            </svg>
            Reset Zoom
          </button>
        )}
        {!isZoomed && chartData.length > 10 && (
          <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-500">Click &amp; drag to zoom</span>
        )}
      </div>

      {/* Main chart */}
      <div className="relative h-[320px] w-full select-none">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-500">
            No data available for this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              onMouseDown={handleMouseDown as never}
              onMouseMove={handleMouseMove as never}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => { setHoverPrice(null); if (isSelecting.current) { isSelecting.current = false; setZoomLeft(null); setZoomRight(null); } }}
            >
              <defs>
                <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gradientColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                tickFormatter={(val) => formatDate(val, range)}
                tick={{ fontSize: 10, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
                minTickGap={50}
              />

              <YAxis
                yAxisId="price"
                domain={[minPrice - pricePad, maxPrice + pricePad]}
                tickFormatter={(val) => `$${Number(val).toFixed(0)}`}
                tick={{ fontSize: 10, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
                width={55}
              />

              {showVolume && (
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  domain={[0, maxVol * 4]}
                  hide
                />
              )}

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const p = payload[0].payload as ChartPoint;
                  return (
                    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 text-xs">
                      <div className="text-zinc-500 dark:text-zinc-400 mb-1">
                        {new Date(p.date).toLocaleString()}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span className="text-zinc-400">O</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">{formatPrice(p.open)}</span>
                        <span className="text-zinc-400">H</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">{formatPrice(p.high)}</span>
                        <span className="text-zinc-400">L</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">{formatPrice(p.low)}</span>
                        <span className="text-zinc-400">C</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">{formatPrice(p.close)}</span>
                        <span className="text-zinc-400">Vol</span>
                        <span className="font-semibold text-zinc-900 dark:text-white">{formatVolume(p.volume)}</span>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Volume bars (background) */}
              {showVolume && (
                <Bar yAxisId="volume" dataKey="volume" barSize={Math.max(1, 300 / chartData.length)} opacity={0.3} isAnimationActive={false}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.close >= d.open ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              )}

              {/* Price — Line mode */}
              {chartMode === "line" && (
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="close"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fill={`url(#grad-${symbol})`}
                  dot={false}
                  activeDot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              )}

              {/* Price — Candle mode: single Bar with custom shape for body + wick */}
              {chartMode === "candle" && (
                <Bar
                  yAxisId="price"
                  dataKey="candleBody"
                  barSize={candleBarSize}
                  shape={<CandlestickShape />}
                  isAnimationActive={false}
                />
              )}

              {/* Moving averages */}
              {showSMA20 && (
                <Line yAxisId="price" type="monotone" dataKey="sma20" stroke="#3b82f6" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
              )}
              {showSMA50 && (
                <Line yAxisId="price" type="monotone" dataKey="sma50" stroke="#f97316" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
              )}

              {/* Zoom selection overlay */}
              {zoomLeft && zoomRight && (
                <ReferenceArea
                  yAxisId="price"
                  x1={zoomLeft}
                  x2={zoomRight}
                  strokeOpacity={0.3}
                  fill="#10b981"
                  fillOpacity={0.1}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Range selectors */}
      <div className="mt-3 flex gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => { setRange(r); setDataSlice(null); }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              range === r
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
