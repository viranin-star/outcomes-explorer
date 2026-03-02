import type { Program } from "@prisma/client";
import type { TransparencyScore } from "@/types";

export function computeTransparencyScore(program: Program): TransparencyScore {
  let total = 0;

  if (program.hasAuditedOutcomes) total += 40;
  if (program.hasPlacementRate) total += 20;
  if (program.hasEmployerList) total += 20;
  if (!program.hasSelfReported) total += 10; // bonus for not being self-reported only
  if (program.dataYear && program.dataYear >= new Date().getFullYear() - 2) total += 10;

  return {
    total,
    hasAuditedOutcomes: program.hasAuditedOutcomes,
    hasSelfReported: program.hasSelfReported,
    dataYear: program.dataYear,
    hasPlacementRate: program.hasPlacementRate,
    hasEmployerList: program.hasEmployerList,
  };
}

export function transparencyLabel(score: number): string {
  if (score >= 80) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
}

export function transparencyColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-500";
}
