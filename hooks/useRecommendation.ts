"use client";

import { useMemo } from "react";
import type { PrioritizedExperiment } from "@/lib/types/prioritization";

export interface UseRecommendationResult {
  recommendedExperiment: PrioritizedExperiment | null;
  restExperiments: PrioritizedExperiment[];
}

export function useRecommendation(
  prioritizedExperiments: PrioritizedExperiment[] | null | undefined
): UseRecommendationResult {
  return useMemo<UseRecommendationResult>(() => {
    if (!prioritizedExperiments || prioritizedExperiments.length === 0) {
      return {
        recommendedExperiment: null,
        restExperiments: [],
      };
    }

    let best: PrioritizedExperiment | null = null;
    for (const exp of prioritizedExperiments) {
      if (!best || exp.compositeScore > best.compositeScore) {
        best = exp;
      }
    }

    if (!best) {
      return {
        recommendedExperiment: null,
        restExperiments: [],
      };
    }

    const rest = prioritizedExperiments.filter(
      (exp) => exp.experimentId !== best!.experimentId
    );

    return {
      recommendedExperiment: best,
      restExperiments: rest,
    };
  }, [prioritizedExperiments]);
}

