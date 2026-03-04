/**
 * Batch scoring: one LLM call returns impact, effort, risk, confidence
 * for all experiments. Prioritization (composite score, ranking, sensitivity)
 * is done in code, not by the LLM.
 */

import { z } from "zod";
import { generateStructured } from "@/lib/ai";
import type { PrioritizationContext } from "@/lib/types/prioritization";

export interface BatchScoringExperimentInput {
  id: string;
  title: string;
  description: string;
  scope: string;
  hypothesis: string;
  evidenceSummary: string;
  dataSummary: string;
  pastPatternsSummary: string;
}

function trimToMaxWords(s: string, max: number): string {
  const words = s.trim().split(/\s+/).filter(Boolean);
  return words.length <= max ? s.trim() : words.slice(0, max).join(" ");
}

const ExperimentScoresSchema = z.object({
  experimentId: z.string(),
  impactScore: z.number().min(1).max(10),
  effortScore: z.number().min(1).max(10),
  riskScore: z.number().min(1).max(10),
  confidenceScore: z.number().min(1).max(10),
  impactExplanation: z.string().optional().transform((s) => (s ? trimToMaxWords(s, 30) : s)),
  effortExplanation: z.string().optional().transform((s) => (s ? trimToMaxWords(s, 30) : s)),
  riskExplanation: z.string().optional().transform((s) => (s ? trimToMaxWords(s, 30) : s)),
  confidenceExplanation: z.string().optional().transform((s) => (s ? trimToMaxWords(s, 30) : s)),
});

const BatchScoringOutputSchema = z.object({
  scores: z.array(ExperimentScoresSchema),
});

type BatchScoringOutput = z.infer<typeof BatchScoringOutputSchema>;

/**
 * Single LLM call that returns impact, effort, risk, and confidence scores
 * (1–10) for each experiment. Explanations are optional.
 * Composite score and ranking are NOT done by the LLM; use PrioritizationEngine
 * with these scores for that.
 */
export async function runBatchScoring(
  experiments: BatchScoringExperimentInput[],
  context: PrioritizationContext
): Promise<Map<string, BatchScoringResult>> {
  if (experiments.length === 0) {
    return new Map();
  }

  const rubric = buildRubric(context);
  const experimentsBlock = experiments
    .map(
      (e, i) =>
        `[Experiment ${i + 1}]
id: ${e.id}
title: ${e.title}
description: ${e.description}
scope: ${e.scope}
hypothesis: ${e.hypothesis}
evidenceSummary: ${e.evidenceSummary}
dataSummary: ${e.dataSummary}
pastPatternsSummary: ${e.pastPatternsSummary}`
    )
    .join("\n\n");

  const systemPrompt = `Output JSON only. No other text.

Return a "scores" array. Each item: experimentId, impactScore, effortScore, riskScore, confidenceScore (1–10). Optional: impactExplanation, effortExplanation, riskExplanation, confidenceExplanation (each max 30 words).

${rubric}`;

  const userPrompt = `Score each experiment. JSON only. scores[].experimentId, impactScore, effortScore, riskScore, confidenceScore. Optional explanations max 30 words.

Experiments:
${experimentsBlock}`;

  const result = await generateStructured<BatchScoringOutput>({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    schema: BatchScoringOutputSchema,
    schemaName: "batch_scoring_output",
  });

  const map = new Map<string, BatchScoringResult>();
  for (const s of result.scores) {
    map.set(s.experimentId, {
      impactScore: s.impactScore,
      effortScore: s.effortScore,
      riskScore: s.riskScore,
      confidenceScore: s.confidenceScore,
      impactExplanation: s.impactExplanation,
      effortExplanation: s.effortExplanation,
      riskExplanation: s.riskExplanation,
      confidenceExplanation: s.confidenceExplanation,
    });
  }
  return map;
}

export interface BatchScoringResult {
  impactScore: number;
  effortScore: number;
  riskScore: number;
  confidenceScore: number;
  impactExplanation?: string;
  effortExplanation?: string;
  riskExplanation?: string;
  confidenceExplanation?: string;
}

function buildRubric(ctx: PrioritizationContext): string {
  const { northStarMetric, productStage, engineeringCapacity, teamSize, riskTolerance } = ctx;
  return `
North star metric: ${northStarMetric}
Product stage: ${productStage}
Engineering capacity: ${engineeringCapacity}
Team size: ${teamSize}
Risk tolerance: ${riskTolerance}

Impact: 1–3 marginal, 4–6 moderate, 7–8 strong, 9–10 transformative (for ${northStarMetric}).
Effort: 1–3 small, 4–6 moderate, 7–8 cross-functional, 9–10 large/infra.
Risk: 1–3 low, 4–6 moderate, 7–8 high, 9–10 very high (technical, adoption, business, reversibility).
Confidence: 1–3 weak evidence, 4–6 moderate, 7–8 strong, 9–10 very strong.
`.trim();
}
