/**
 * Unified Analysis Agent
 * Single OpenAI API call: problem summary, segments, root causes,
 * hypotheses, and experiments in one structured response.
 */

import { z } from "zod";
import { generateStructured } from "@/lib/ai/service";
import type { Agent } from "@/lib/types";
import { buildCacheKey, getOrSet } from "@/lib/cache/analysisCache";

// ─── Input ────────────────────────────────────────────────────────────────────

export const UnifiedAnalysisInputSchema = z.object({
  problem: z.string().min(1, "Problem is required"),
  context: z
    .object({
      northStarMetric: z.string().optional(),
      productStage: z.string().optional(),
    })
    .optional(),
});

export type UnifiedAnalysisInput = z.infer<typeof UnifiedAnalysisInputSchema>;

// ─── Output (strict schema, max counts, explanations ≤30 words) ─────────────────

const SegmentSchema = z.object({
  name: z.string(),
  description: z.string(),
});

function trimToMaxWords(s: string, maxWords: number): string {
  const words = s.trim().split(/\s+/).filter(Boolean);
  return words.length <= maxWords ? s.trim() : words.slice(0, maxWords).join(" ");
}

const RootCauseSchema = z.object({
  cause: z.string(),
  explanation: z.string().transform((s) => trimToMaxWords(s, 30)),
});

const HypothesisSchema = z.object({
  hypothesis: z.string(),
});

const ExperimentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

export const UnifiedAnalysisOutputSchema = z.object({
  problem_summary: z.string(),
  segments: z.array(SegmentSchema).max(3),
  root_causes: z.array(RootCauseSchema).max(3),
  hypotheses: z.array(HypothesisSchema),
  experiments: z.array(ExperimentSchema).max(5),
});

export type UnifiedAnalysisOutput = z.infer<typeof UnifiedAnalysisOutputSchema>;

// ─── Agent ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Output JSON only. No other text.

Strict limits (do not exceed):
- segments: array, max 3 items. Each: { name, description }.
- root_causes: array, max 3 items. Each: { cause, explanation }. explanation max 30 words.
- experiments: array, max 5 items. Each: { id (kebab-case), title, description }.

Also include: problem_summary (string), hypotheses (array of { hypothesis }).`;

export const UnifiedAnalysisAgent: Agent<
  UnifiedAnalysisInput,
  UnifiedAnalysisOutput
> = {
  name: "unified-analysis",
  inputSchema: UnifiedAnalysisInputSchema,
  outputSchema: UnifiedAnalysisOutputSchema,

  async run(input) {
    const key = buildCacheKey(input.problem, input.context);
    return getOrSet(key, async () => {
      const contextLine =
        input.context &&
        (input.context.northStarMetric || input.context.productStage)
          ? `Context: ${[
              input.context.northStarMetric &&
                `North star metric: ${input.context.northStarMetric}`,
              input.context.productStage &&
                `Product stage: ${input.context.productStage}`,
            ]
              .filter(Boolean)
              .join(". ")}`
          : "";

      const userContent = `Problem:\n${input.problem}\n\n${contextLine}`.trim();

      return generateStructured({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        schema: UnifiedAnalysisOutputSchema,
        schemaName: "unified_analysis_output",
      });
    });
  },
};
