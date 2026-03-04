import type {
  PrioritizedExperiment,
  SensitivityRange,
} from "@/lib/types/prioritization";

/**
 * Experiment scores for one item (e.g. from ExperimentScoringAgent).
 * All scores 1–10.
 */
export interface PrecomputedScores {
  impactScore: number;
  effortScore: number;
  riskScore: number;
  confidenceScore: number;
  impactExplanation?: string;
  effortExplanation?: string;
  riskExplanation?: string;
  confidenceExplanation?: string;
}

/**
 * Minimal experiment shape for prioritization.
 * Callers pass this plus scores to get ranked output.
 */
export interface PrioritizationExperimentInput {
  id: string;
  title: string;
  description: string;
  scope?: string;
  hypothesis?: string;
  evidenceSummary?: string;
  dataSummary?: string;
  pastPatternsSummary?: string;
}

/**
 * Composite score formula: (impact * confidence) / effort * (1 - risk/20)
 * Scores are 1–10; effort is clamped to >= 1 to avoid division by zero.
 */
function computeCompositeScore(
  impact: number,
  effort: number,
  confidence: number,
  risk: number
): number {
  const safeEffort = Math.max(1, effort);
  const riskFactor = 1 - Math.min(Math.max(risk, 0), 20) / 20;
  return (impact * confidence) / safeEffort * riskFactor;
}

/**
 * Sensitivity range by varying impact and effort ±20%; confidence and risk fixed.
 */
function computeSensitivityRange(
  impact: number,
  effort: number,
  confidence: number,
  risk: number
): SensitivityRange {
  const factors = [0.8, 1, 1.2];
  let minScore = Infinity;
  let maxScore = -Infinity;
  for (const iF of factors) {
    for (const eF of factors) {
      const score = computeCompositeScore(
        impact * iF,
        Math.max(1, effort * eF),
        confidence,
        risk
      );
      if (Number.isFinite(score)) {
        minScore = Math.min(minScore, score);
        maxScore = Math.max(maxScore, score);
      }
    }
  }
  return {
    minScore: Number.isFinite(minScore) ? minScore : 0,
    maxScore: Number.isFinite(maxScore) ? maxScore : 0,
  };
}

/**
 * Prioritization engine: pure code, no LLM.
 * Receives experiment scores, computes composite score, sorts, returns ranked list.
 */
export class PrioritizationEngine {
  /**
   * Prioritize using precomputed scores.
   * 1. Compute composite score: (impact * confidence) / effort * (1 - risk/20)
   * 2. Sort by composite score descending
   * 3. Return ranked experiments
   */
  prioritizeWithPrecomputedScores(
    experiments: PrioritizationExperimentInput[],
    _context: unknown,
    scoresByExperimentId: Map<string, PrecomputedScores>
  ): PrioritizedExperiment[] {
    const results: PrioritizedExperiment[] = [];

    for (const experiment of experiments) {
      const scores = scoresByExperimentId.get(experiment.id);
      if (!scores) continue;

      const compositeScore = computeCompositeScore(
        scores.impactScore,
        scores.effortScore,
        scores.confidenceScore,
        scores.riskScore
      );

      const sensitivityRange = computeSensitivityRange(
        scores.impactScore,
        scores.effortScore,
        scores.confidenceScore,
        scores.riskScore
      );

      const reasoningParts = [
        scores.impactExplanation && `Impact: ${scores.impactExplanation}`,
        scores.effortExplanation && `Effort: ${scores.effortExplanation}`,
        scores.riskExplanation && `Risk: ${scores.riskExplanation}`,
        scores.confidenceExplanation &&
          `Confidence: ${scores.confidenceExplanation}`,
      ].filter(Boolean);
      const reasoning =
        reasoningParts.length > 0
          ? reasoningParts.join("\n\n")
          : `Impact ${scores.impactScore}, Effort ${scores.effortScore}, Risk ${scores.riskScore}, Confidence ${scores.confidenceScore}.`;

      results.push({
        experimentId: experiment.id,
        impactScore: scores.impactScore,
        effortScore: scores.effortScore,
        riskScore: scores.riskScore,
        confidenceScore: scores.confidenceScore,
        compositeScore,
        reasoning,
        sensitivityRange,
      });
    }

    return results.sort((a, b) => b.compositeScore - a.compositeScore);
  }
}
