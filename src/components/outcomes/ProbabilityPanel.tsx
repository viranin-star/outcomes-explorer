"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import type { GoalProbability } from "@/types";
import { computeGoalProbability } from "@/lib/scoring/payback";

interface Props {
  earlyMedian: number | null;
  midMedian: number | null;
  earlyP75: number | null;
  probabilityScores: (number | null)[];
}

const LABEL_STYLES: Record<string, string> = {
  "Likely": "bg-green-100 text-green-800 border-green-200",
  "Possible": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Low probability": "bg-red-100 text-red-800 border-red-200",
};

export function ProbabilityPanel({
  earlyMedian,
  midMedian,
  earlyP75,
  probabilityScores,
}: Props) {
  const [targetSalary, setTargetSalary] = useState(75000);
  const [targetYears, setTargetYears] = useState(5);

  const result: GoalProbability = computeGoalProbability(
    targetSalary,
    targetYears,
    earlyMedian,
    midMedian,
    earlyP75,
    probabilityScores
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Target salary</span>
          <span className="font-medium text-slate-800">
            ${targetSalary.toLocaleString()}
          </span>
        </div>
        <Slider
          min={30000}
          max={200000}
          step={5000}
          value={[targetSalary]}
          onValueChange={([v]) => setTargetSalary(v)}
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>$30k</span>
          <span>$200k</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Within</span>
          <span className="font-medium text-slate-800">{targetYears} years</span>
        </div>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[targetYears]}
          onValueChange={([v]) => setTargetYears(v)}
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>1 yr</span>
          <span>10 yrs</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-500 mb-2">
          If your goal is{" "}
          <span className="font-medium text-slate-700">
            ${targetSalary.toLocaleString()}
          </span>{" "}
          within{" "}
          <span className="font-medium text-slate-700">{targetYears} years</span>,
          this path is:
        </p>
        <span
          className={`inline-block px-4 py-2 rounded-full border text-sm font-semibold ${
            LABEL_STYLES[result.label]
          }`}
        >
          {result.label}
        </span>
        <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              result.label === "Likely"
                ? "bg-green-500"
                : result.label === "Possible"
                ? "bg-yellow-500"
                : "bg-red-400"
            }`}
            style={{ width: `${Math.round(result.score * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1 text-right">
          Confidence score: {Math.round(result.score * 100)}%
        </p>
      </div>
    </div>
  );
}
