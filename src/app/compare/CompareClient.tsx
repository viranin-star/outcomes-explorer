"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { computeTransparencyScore } from "@/lib/scoring/transparency";
import { computePayback } from "@/lib/scoring/payback";

interface ProgramOption {
  id: string;
  name: string;
  slug: string;
  degreeLevel: string;
  institution: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FullProgram = any; // Prisma result with includes

interface Props {
  allPrograms: ProgramOption[];
  initialPrograms: FullProgram[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

function fmt(n: number | null | undefined) {
  if (!n) return "—";
  return `$${n.toLocaleString()}`;
}

function pct(n: number | null | undefined) {
  if (!n) return "—";
  return `${Math.round(n * 100)}%`;
}

export function CompareClient({ allPrograms, initialPrograms }: Props) {
  const [selected, setSelected] = useState<FullProgram[]>(initialPrograms);

  function addProgram(slug: string) {
    if (selected.length >= 3) return;
    if (selected.find((p) => p.slug === slug)) return;
    const opt = allPrograms.find((p) => p.slug === slug);
    if (!opt) return;
    // Navigate to add it via URL (triggers server re-fetch)
    const slugs = [...selected.map((p) => p.slug), slug].join(",");
    window.location.href = `/compare?programs=${slugs}`;
  }

  function removeProgram(slug: string) {
    const remaining = selected.filter((p) => p.slug !== slug);
    if (remaining.length === 0) {
      window.location.href = "/compare";
    } else {
      window.location.href = `/compare?programs=${remaining.map((p) => p.slug).join(",")}`;
    }
  }

  const available = allPrograms.filter(
    (p) => !selected.find((s) => s.slug === p.slug)
  );

  // Build comparison data
  const compData = selected.map((p, i) => {
    const earnings = p.earnings[0] ?? null;
    const transparency = computeTransparencyScore(p);
    const payback = earnings
      ? computePayback(p.tuitionMin, p.tuitionMax, earnings.earlyMedian, earnings.noDegreeMed)
      : null;

    return {
      program: p,
      earnings,
      transparency,
      payback,
      color: COLORS[i],
    };
  });

  // Radar chart data — normalize to 0–100 scale
  const radarData = [
    {
      metric: "Transparency",
      ...Object.fromEntries(compData.map((d) => [d.program.name, d.transparency.total])),
    },
    {
      metric: "Early Median ($k)",
      ...Object.fromEntries(
        compData.map((d) => [
          d.program.name,
          d.earnings?.earlyMedian ? Math.min(Math.round(d.earnings.earlyMedian / 1500), 100) : 0,
        ])
      ),
    },
    {
      metric: "Mid Median ($k)",
      ...Object.fromEntries(
        compData.map((d) => [
          d.program.name,
          d.earnings?.midMedian ? Math.min(Math.round(d.earnings.midMedian / 2000), 100) : 0,
        ])
      ),
    },
    {
      metric: "IRR",
      ...Object.fromEntries(
        compData.map((d) => [
          d.program.name,
          d.payback?.irrEstimate ? Math.min(d.payback.irrEstimate, 100) : 0,
        ])
      ),
    },
    {
      metric: "Payback Speed",
      ...Object.fromEntries(
        compData.map((d) => [
          d.program.name,
          d.payback?.paybackYears ? Math.max(0, 100 - d.payback.paybackYears * 8) : 0,
        ])
      ),
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Compare Programs</h1>
        <p className="text-slate-500 mt-1">Side-by-side outcomes comparison across up to 3 programs.</p>
      </div>

      {/* Program selector */}
      <div className="flex flex-wrap gap-3 items-center">
        {selected.map((p, i) => (
          <div
            key={p.slug}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: COLORS[i] }}
          >
            {p.name}
            <button onClick={() => removeProgram(p.slug)} className="hover:opacity-75">
              <X size={14} />
            </button>
          </div>
        ))}
        {selected.length < 3 && available.length > 0 && (
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
            value=""
            onChange={(e) => addProgram(e.target.value)}
          >
            <option value="">+ Add program</option>
            {available.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} {p.institution ? `— ${p.institution}` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {selected.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          Select up to 3 programs above to compare.
        </div>
      )}

      {selected.length > 0 && (
        <>
          {/* Radar overview */}
          {selected.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">At a Glance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    {compData.map((d) => (
                      <Radar
                        key={d.program.slug}
                        name={d.program.name}
                        dataKey={d.program.name}
                        stroke={d.color}
                        fill={d.color}
                        fillOpacity={0.15}
                      />
                    ))}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Side-by-side table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 pr-6 text-slate-500 font-medium w-40">Metric</th>
                      {compData.map((d) => (
                        <th key={d.program.slug} className="text-left py-3 pr-6 font-semibold text-slate-800">
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: d.color }}
                            />
                            {d.program.name}
                          </span>
                          {d.program.institution && (
                            <span className="text-xs font-normal text-slate-400 ml-4">
                              {d.program.institution}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <CompareRow label="Degree">
                      {compData.map((d) => (
                        <Badge key={d.program.slug} variant="secondary">{d.program.degreeLevel}</Badge>
                      ))}
                    </CompareRow>
                    <CompareRow label="Tuition range">
                      {compData.map((d) => (
                        <span key={d.program.slug}>
                          {d.program.tuitionMin && d.program.tuitionMax
                            ? `${fmt(d.program.tuitionMin)} – ${fmt(d.program.tuitionMax)}`
                            : "—"}
                        </span>
                      ))}
                    </CompareRow>
                    <CompareRow label="Early median" highlight>
                      {compData.map((d) => (
                        <span key={d.program.slug} className="font-semibold">
                          {fmt(d.earnings?.earlyMedian)}
                        </span>
                      ))}
                    </CompareRow>
                    <CompareRow label="Early P25 – P75">
                      {compData.map((d) => (
                        <span key={d.program.slug} className="text-slate-500">
                          {d.earnings
                            ? `${fmt(d.earnings.earlyP25)} – ${fmt(d.earnings.earlyP75)}`
                            : "—"}
                        </span>
                      ))}
                    </CompareRow>
                    <CompareRow label="Mid-career median" highlight>
                      {compData.map((d) => (
                        <span key={d.program.slug} className="font-semibold">
                          {fmt(d.earnings?.midMedian)}
                        </span>
                      ))}
                    </CompareRow>
                    <CompareRow label="Payback period">
                      {compData.map((d) => (
                        <span key={d.program.slug}>
                          {d.payback?.paybackYears ? `${d.payback.paybackYears} yrs` : "—"}
                        </span>
                      ))}
                    </CompareRow>
                    <CompareRow label="Est. IRR">
                      {compData.map((d) => (
                        <span key={d.program.slug}>
                          {d.payback?.irrEstimate ? `${d.payback.irrEstimate}%` : "—"}
                        </span>
                      ))}
                    </CompareRow>
                    <CompareRow label="Primary occupations">
                      {compData.map((d) => (
                        <div key={d.program.slug} className="space-y-1">
                          {d.program.occupations
                            .filter((o: { commonality: string }) => o.commonality === "primary")
                            .slice(0, 2)
                            .map((o: { socCode: string; occupation: { title: string }; probabilityScore: number | null }) => (
                              <div key={o.socCode} className="text-xs">
                                <span className="text-slate-700">{o.occupation.title}</span>
                                {o.probabilityScore && (
                                  <span className="text-slate-400 ml-1">
                                    ({pct(o.probabilityScore)} entry)
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      ))}
                    </CompareRow>
                    <CompareRow label="Transparency score" highlight>
                      {compData.map((d) => (
                        <span
                          key={d.program.slug}
                          className={`font-semibold ${
                            d.transparency.total >= 80
                              ? "text-green-600"
                              : d.transparency.total >= 50
                              ? "text-yellow-600"
                              : "text-red-500"
                          }`}
                        >
                          {d.transparency.total} / 100
                        </span>
                      ))}
                    </CompareRow>
                    <CompareRow label="Audited outcomes">
                      {compData.map((d) => (
                        <span key={d.program.slug}>
                          {d.transparency.hasAuditedOutcomes ? "✓" : "✗"}
                        </span>
                      ))}
                    </CompareRow>
                    <CompareRow label="Placement rate">
                      {compData.map((d) => (
                        <span key={d.program.slug}>
                          {d.transparency.hasPlacementRate ? "✓" : "✗"}
                        </span>
                      ))}
                    </CompareRow>
                    <CompareRow label="Data year">
                      {compData.map((d) => (
                        <span key={d.program.slug}>{d.transparency.dataYear ?? "—"}</span>
                      ))}
                    </CompareRow>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Links to detail pages */}
          <div className="flex gap-3 flex-wrap">
            {compData.map((d) => (
              <a
                key={d.program.slug}
                href={`/programs/${d.program.slug}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View full {d.program.name} page →
              </a>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function CompareRow({
  label,
  children,
  highlight,
}: {
  label: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-slate-50/50" : ""}>
      <td className="py-3 pr-6 text-slate-500 align-top">{label}</td>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <td key={i} className="py-3 pr-6 align-top">
              {child}
            </td>
          ))
        : <td className="py-3 pr-6 align-top">{children}</td>}
    </tr>
  );
}
