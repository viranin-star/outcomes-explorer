export interface EarningsBand {
  p25: number | null;
  median: number | null;
  p75: number | null;
}

export interface EarningsTrajectory {
  early: EarningsBand; // 0–3 years
  mid: EarningsBand;   // 5–10 years
  noDegreeMed: number | null;
  source: string | null;
}

export interface OccupationSummary {
  socCode: string;
  title: string;
  commonality: "primary" | "secondary" | "possible";
  probabilityScore: number | null;
  requiresLicense: boolean;
}

export interface TransparencyScore {
  total: number; // 0–100
  hasAuditedOutcomes: boolean;
  hasSelfReported: boolean;
  dataYear: number | null;
  hasPlacementRate: boolean;
  hasEmployerList: boolean;
}

export interface ProgramDetail {
  id: string;
  name: string;
  slug: string;
  degreeLevel: string;
  institution: string | null;
  tuitionMin: number | null;
  tuitionMax: number | null;
  earnings: EarningsTrajectory | null;
  occupations: OccupationSummary[];
  transparency: TransparencyScore;
}

export interface PaybackAnalysis {
  tuitionMidpoint: number;
  earlyMedian: number;
  noDegreeMed: number;
  incrementalAnnual: number;
  paybackYears: number | null;
  irrEstimate: number | null;
}

export type ProbabilityLabel = "Likely" | "Possible" | "Low probability";

export interface GoalProbability {
  targetSalary: number;
  targetYears: number;
  label: ProbabilityLabel;
  score: number; // 0–1
}
