import type { ScoringModel } from "./ScoringModel";

export interface SensitivityRangeResult {
  minScore: number;
  maxScore: number;
}

/**
 * Computes a simple sensitivity range for a scoring model by varying
 * impact and effort by ±20% around their base values.
 *
 * Confidence and risk are kept constant.
 */
export function computeSensitivityRange(
  baseImpact: number,
  baseEffort: number,
  baseConfidence: number,
  baseRisk: number,
  scoringModel: ScoringModel
): SensitivityRangeResult {
  const impactFactors = [0.8, 1, 1.2];
  const effortFactors = [0.8, 1, 1.2];

  const scores: number[] = [];

  for (const iFactor of impactFactors) {
    for (const eFactor of effortFactors) {
      const impact = baseImpact * iFactor;
      const effort = baseEffort * eFactor;
      const score = scoringModel.compute(
        impact,
        effort,
        baseConfidence,
        baseRisk
      );
      if (Number.isFinite(score)) {
        scores.push(score);
      }
    }
  }

  if (scores.length === 0) {
    return { minScore: 0, maxScore: 0 };
  }

  let minScore = scores[0];
  let maxScore = scores[0];

  for (const s of scores) {
    if (s < minScore) minScore = s;
    if (s > maxScore) maxScore = s;
  }

  return { minScore, maxScore };
}

