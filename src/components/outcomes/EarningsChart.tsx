"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { EarningsTrajectory, PaybackAnalysis } from "@/types";

interface Props {
  earnings: EarningsTrajectory;
  payback: PaybackAnalysis | null;
  tuitionMidpoint: number | null;
}

function fmt(n: number) {
  return `$${(n / 1000).toFixed(0)}k`;
}

export function EarningsChart({ earnings, payback, tuitionMidpoint }: Props) {
  const data = [
    {
      label: "No Degree",
      p25: 0,
      median: earnings.noDegreeMed ?? 0,
      p75: 0,
      isBaseline: true,
    },
    {
      label: "Early (0–3yr)",
      p25: earnings.early.p25 ?? 0,
      median: earnings.early.median ?? 0,
      p75: earnings.early.p75 ?? 0,
      isBaseline: false,
    },
    {
      label: "Mid (5–10yr)",
      p25: earnings.mid.p25 ?? 0,
      median: earnings.mid.median ?? 0,
      p75: earnings.mid.p75 ?? 0,
      isBaseline: false,
    },
  ];

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 12 }}
            width={48}
          />
          <Tooltip
            formatter={(value: number | string) => [`$${Number(value).toLocaleString()}`, ""]}
          />
          {/* 25th percentile bar (bottom portion) */}
          <Bar dataKey="p25" stackId="a" fill="transparent" />
          {/* Median bar */}
          <Bar dataKey="median" stackId="b" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isBaseline ? "#94a3b8" : "#3b82f6"}
                opacity={entry.isBaseline ? 0.6 : 1}
              />
            ))}
          </Bar>
          {/* P75 bar */}
          <Bar dataKey="p75" stackId="c" fill="transparent" />
          {tuitionMidpoint && (
            <ReferenceLine
              y={tuitionMidpoint / 10} // rough annualized cost visual indicator
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: "Tuition", position: "right", fontSize: 11 }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>

      {/* Risk band legend */}
      <div className="flex gap-6 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-200" />
          <span>25th percentile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span>Median</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-blue-800" />
          <span>75th percentile</span>
        </div>
      </div>

      {/* Payback summary */}
      {payback && (
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Tuition</p>
            <p className="text-lg font-semibold text-slate-800">
              ${payback.tuitionMidpoint.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Payback</p>
            <p className="text-lg font-semibold text-slate-800">
              {payback.paybackYears ? `${payback.paybackYears} yrs` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Est. IRR</p>
            <p className="text-lg font-semibold text-slate-800">
              {payback.irrEstimate ? `${payback.irrEstimate}%` : "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
