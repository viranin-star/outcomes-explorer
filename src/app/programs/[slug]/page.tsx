import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EarningsChart } from "@/components/outcomes/EarningsChart";
import { ProbabilityPanel } from "@/components/outcomes/ProbabilityPanel";
import { computeTransparencyScore, transparencyLabel, transparencyColor } from "@/lib/scoring/transparency";
import { computePayback } from "@/lib/scoring/payback";
import type { EarningsTrajectory, OccupationSummary } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProgramPage({ params }: Props) {
  const { slug } = await params;

  const program = await prisma.program.findUnique({
    where: { slug },
    include: {
      occupations: { include: { occupation: true } },
      earnings: { orderBy: { cohortYear: "desc" }, take: 1 },
    },
  });

  if (!program) notFound();

  const latestEarnings = program.earnings[0] ?? null;

  const earnings: EarningsTrajectory | null = latestEarnings
    ? {
        early: {
          p25: latestEarnings.earlyP25,
          median: latestEarnings.earlyMedian,
          p75: latestEarnings.earlyP75,
        },
        mid: {
          p25: latestEarnings.midP25,
          median: latestEarnings.midMedian,
          p75: latestEarnings.midP75,
        },
        noDegreeMed: latestEarnings.noDegreeMed,
        source: latestEarnings.source,
      }
    : null;

  const occupations: OccupationSummary[] = program.occupations.map((po) => ({
    socCode: po.socCode,
    title: po.occupation.title,
    commonality: po.commonality as OccupationSummary["commonality"],
    probabilityScore: po.probabilityScore,
    requiresLicense: po.occupation.requiresLicense,
  }));

  const transparency = computeTransparencyScore(program);
  const payback = earnings
    ? computePayback(
        program.tuitionMin,
        program.tuitionMax,
        earnings.early.median,
        earnings.noDegreeMed
      )
    : null;

  const primaryOccupations = occupations.filter((o) => o.commonality === "primary");
  const otherOccupations = occupations.filter((o) => o.commonality !== "primary");

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{program.degreeLevel}</Badge>
          {program.institution && (
            <span className="text-sm text-slate-500">{program.institution}</span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{program.name}</h1>
        {program.tuitionMin && program.tuitionMax && (
          <p className="text-slate-500 text-sm">
            Tuition: ${program.tuitionMin.toLocaleString()} – $
            {program.tuitionMax.toLocaleString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: 2/3 width */}
        <div className="lg:col-span-2 space-y-6">

          {/* Career Path Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Career Path Snapshot</CardTitle>
              <p className="text-sm text-slate-500">
                Graduates most commonly enter:
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {primaryOccupations.length > 0 ? (
                primaryOccupations.map((occ) => (
                  <div
                    key={occ.socCode}
                    className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {occ.title}
                      </p>
                      <p className="text-xs text-slate-400">SOC {occ.socCode}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {occ.requiresLicense && (
                        <Badge variant="outline" className="text-xs">
                          Licensed
                        </Badge>
                      )}
                      {occ.probabilityScore && (
                        <span className="text-xs text-slate-500">
                          {Math.round(occ.probabilityScore * 100)}% entry est.
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No occupation data available yet.
                </p>
              )}
              {otherOccupations.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-slate-400 mb-1">Also possible:</p>
                  <div className="flex flex-wrap gap-2">
                    {otherOccupations.map((occ) => (
                      <Badge key={occ.socCode} variant="secondary" className="text-xs">
                        {occ.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Earnings & Risk Band */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Earnings & Risk Band</CardTitle>
              {latestEarnings?.source && (
                <p className="text-xs text-slate-400">
                  Source: {latestEarnings.source}
                  {latestEarnings.cohortYear ? ` · ${latestEarnings.cohortYear}` : ""}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {earnings ? (
                <EarningsChart
                  earnings={earnings}
                  payback={payback}
                  tuitionMidpoint={payback?.tuitionMidpoint ?? null}
                />
              ) : (
                <p className="text-sm text-slate-400 italic">
                  Earnings data not yet available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: 1/3 width */}
        <div className="space-y-6">

          {/* Probability Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Goal Probability</CardTitle>
            </CardHeader>
            <CardContent>
              <ProbabilityPanel
                earlyMedian={earnings?.early.median ?? null}
                midMedian={earnings?.mid.median ?? null}
                earlyP75={earnings?.early.p75 ?? null}
                probabilityScores={occupations.map((o) => o.probabilityScore)}
              />
            </CardContent>
          </Card>

          {/* Transparency Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Outcomes Transparency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-bold ${transparencyColor(transparency.total)}`}>
                  {transparency.total}
                </span>
                <span className="text-slate-400 text-sm mb-1">/ 100</span>
                <span className={`text-sm font-medium mb-1 ${transparencyColor(transparency.total)}`}>
                  {transparencyLabel(transparency.total)}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    transparency.total >= 80
                      ? "bg-green-500"
                      : transparency.total >= 50
                      ? "bg-yellow-500"
                      : "bg-red-400"
                  }`}
                  style={{ width: `${transparency.total}%` }}
                />
              </div>
              <ul className="space-y-1 text-sm">
                <TransparencyRow label="Audited outcomes" value={transparency.hasAuditedOutcomes} />
                <TransparencyRow label="Placement rate published" value={transparency.hasPlacementRate} />
                <TransparencyRow label="Employer list available" value={transparency.hasEmployerList} />
                <TransparencyRow label="Recent data (≤2 yrs)" value={!!(transparency.dataYear && transparency.dataYear >= new Date().getFullYear() - 2)} />
                <TransparencyRow label="Not self-reported only" value={!transparency.hasSelfReported} />
              </ul>
            </CardContent>
          </Card>

          {/* Compare CTA */}
          <a
            href={`/compare?programs=${program.slug}`}
            className="block w-full text-center py-2 px-4 rounded-lg border border-blue-500 text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Compare with other programs
          </a>
        </div>
      </div>
    </main>
  );
}

function TransparencyRow({ label, value }: { label: string; value: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span>{value ? "✓" : "✗"}</span>
    </li>
  );
}
