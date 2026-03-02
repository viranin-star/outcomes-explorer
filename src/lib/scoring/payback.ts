import type { PaybackAnalysis, GoalProbability, ProbabilityLabel } from "@/types";

export function computePayback(
  tuitionMin: number | null,
  tuitionMax: number | null,
  earlyMedian: number | null,
  noDegreeMed: number | null
): PaybackAnalysis | null {
  if (!earlyMedian) return null;

  const tuitionMidpoint =
    tuitionMin && tuitionMax
      ? Math.round((tuitionMin + tuitionMax) / 2)
      : tuitionMin ?? tuitionMax ?? 0;

  const baseline = noDegreeMed ?? 35000;
  const incrementalAnnual = earlyMedian - baseline;

  const paybackYears =
    incrementalAnnual > 0
      ? Math.round((tuitionMidpoint / incrementalAnnual) * 10) / 10
      : null;

  // Simplified IRR: solve for r in NPV=0 over 30-year horizon
  const irrEstimate = estimateIRR(tuitionMidpoint, incrementalAnnual, 30);

  return {
    tuitionMidpoint,
    earlyMedian,
    noDegreeMed: baseline,
    incrementalAnnual,
    paybackYears,
    irrEstimate,
  };
}

function estimateIRR(
  cost: number,
  annualBenefit: number,
  years: number
): number | null {
  if (cost <= 0 || annualBenefit <= 0) return null;

  // Binary search for IRR
  let lo = 0;
  let hi = 1;

  for (let i = 0; i < 50; i++) {
    const r = (lo + hi) / 2;
    let npv = -cost;
    for (let t = 1; t <= years; t++) {
      npv += annualBenefit / Math.pow(1 + r, t);
    }
    if (npv > 0) lo = r;
    else hi = r;
  }

  return Math.round(((lo + hi) / 2) * 1000) / 10; // return as %
}

export function computeGoalProbability(
  targetSalary: number,
  targetYears: number,
  earlyMedian: number | null,
  midMedian: number | null,
  earlyP75: number | null,
  probabilityScores: (number | null)[]
): GoalProbability {
  const relevantMedian = targetYears <= 3 ? earlyMedian : midMedian;
  const avgProbability =
    probabilityScores.filter((p): p is number => p !== null).reduce((a, b) => a + b, 0) /
    (probabilityScores.filter((p) => p !== null).length || 1);

  let score = 0;

  // Salary reachability
  if (relevantMedian && relevantMedian >= targetSalary) score += 0.5;
  else if (earlyP75 && earlyP75 >= targetSalary) score += 0.3;
  else score += 0.1;

  // Occupation entry probability
  score += avgProbability * 0.5;

  score = Math.min(score, 1);

  let label: ProbabilityLabel;
  if (score >= 0.65) label = "Likely";
  else if (score >= 0.35) label = "Possible";
  else label = "Low probability";

  return { targetSalary, targetYears, label, score };
}
