/**
 * Experiment Scoring Agent
 * Single LLM call: scores all experiments (impact, effort, risk, confidence) with reasoning.
 */

import { z } from "zod";
import { generateStructured } from "@/lib/ai/service";
import type { Agent } from "@/lib/types";
import type { PrioritizationContext } from "@/lib/types/prioritization";
import { buildCacheKey, getOrSet } from "@/lib/cache/analysisCache";

// ─── Input ───────────────────────────────────────────────────────────────────

const ExperimentItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

export const ExperimentScoringInputSchema = z.object({
  experiments: z.array(ExperimentItemSchema),
  context: z.object({
    northStarMetric: z.string(),
    productStage: z.string(),
    teamSize: z.number(),
    engineeringCapacity: z.number(),
    riskTolerance: z.string(),
  }),
});

export type ExperimentScoringInput = z.infer<typeof ExperimentScoringInputSchema>;

// ─── Output (scores 1–10, reasoning max 30 words) ──────────────────────────────

function trimToMaxWords(s: string, maxWords: number): string {
  const words = s.trim().split(/\s+/).filter(Boolean);
  return words.length <= maxWords ? s.trim() : words.slice(0, maxWords).join(" ");
}

const ScoreEntrySchema = z.object({
  experimentId: z.string(),
  impact: z.number().min(1).max(10),
  effort: z.number().min(1).max(10),
  risk: z.number().min(1).max(10),
  confidence: z.number().min(1).max(10),
  reasoning: z.string().transform((s) => trimToMaxWords(s, 30)),
});

export const ExperimentScoringOutputSchema = z.object({
  scores: z.array(ScoreEntrySchema),
});

export type ExperimentScoringOutput = z.infer<typeof ExperimentScoringOutputSchema>;

// ─── Agent ───────────────────────────────────────────────────────────────────

function buildSystemPrompt(ctx: PrioritizationContext): string {
  return `Output JSON only. No other text.

Return a "scores" array. Each item: { experimentId, impact, effort, risk, confidence, reasoning }.
- impact, effort, risk, confidence: integers 1–10.
- reasoning: max 30 words.

North star: ${ctx.northStarMetric}. productStage=${ctx.productStage}, riskTolerance=${ctx.riskTolerance}.`;
}

export const ExperimentScoringAgent: Agent<
  ExperimentScoringInput,
  ExperimentScoringOutput
> = {
  name: "experiment-scoring",
  inputSchema: ExperimentScoringInputSchema,
  outputSchema: ExperimentScoringOutputSchema,

  async run(input) {
    if (input.experiments.length === 0) {
      return { scores: [] };
    }

    const key = buildCacheKey(
      JSON.stringify(input.experiments),
      input.context
    );
    return getOrSet(key, async () => {
      const ctx = input.context as PrioritizationContext;
      const experimentsBlock = input.experiments
        .map(
          (e, i) =>
            `[${i + 1}] id: ${e.id}\ntitle: ${e.title}\ndescription: ${e.description}`
        )
        .join("\n\n");

      return generateStructured<ExperimentScoringOutput>({
        messages: [
          { role: "system", content: buildSystemPrompt(ctx) },
          {
            role: "user",
            content: `Score each experiment. JSON only. scores[].experimentId, impact, effort, risk, confidence (1–10), reasoning (max 30 words).\n\nExperiments:\n${experimentsBlock}`,
          },
        ],
        schema: ExperimentScoringOutputSchema,
        schemaName: "experiment_scoring_output",
      });
    });
  },
};
