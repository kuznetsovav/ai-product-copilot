/**
 * Segmentation Agent
 * Derives user segments from a structured problem.
 * Outputs: behavioral, lifecycle, and intent-based segments.
 */

import { z } from "zod";
import { generateStructured } from "@/lib/ai/service";
import type { Agent } from "@/lib/types";
// ─── Schemas ────────────────────────────────────────────────────────────────

const SegmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  criteria: z.array(z.string()),
});

export const SegmentationInputSchema = z.object({
  funnelStage: z.string(),
  likelyFrictionPoints: z.array(z.string()),
  intentMismatch: z.object({
    userExpectation: z.string(),
    productReality: z.string(),
    gap: z.string(),
  }),
  coreQuestion: z.string().optional(),
});

export type SegmentationInput = z.infer<typeof SegmentationInputSchema>;

export const SegmentationOutputSchema = z.object({
  behavioralSegments: z.array(SegmentSchema),
  lifecycleSegments: z.array(SegmentSchema),
  intentBasedSegments: z.array(SegmentSchema),
});

export type SegmentationOutput = z.infer<typeof SegmentationOutputSchema>;

// ─── Agent ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert product strategist specializing in user segmentation. Your role is to derive actionable user segments from a structured product problem.

Given a structured problem (funnel stage, friction points, intent mismatch), produce three types of segments:

1. behavioralSegments: Segments based on usage behavior (e.g. power users, passive users, at-risk, trial burners). Each has id, name, description, criteria.
2. lifecycleSegments: Segments based on user lifecycle stage (e.g. new users, activated, active, dormant, churned, resurrected). Each has id, name, description, criteria.
3. intentBasedSegments: Segments based on user intent (e.g. evaluators, converters, expanders, problem-solvers). Each has id, name, description, criteria.

Be specific to the problem. Avoid generic segments. Criteria should be measurable or observable.`;

export const SegmentationAgent: Agent<
  SegmentationInput,
  SegmentationOutput
> = {
  name: "segmentation",
  inputSchema: SegmentationInputSchema,
  outputSchema: SegmentationOutputSchema,

  async run(input) {
    return generateStructured({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Structured problem:\n${JSON.stringify(input, null, 2)}` },
      ],
      schema: SegmentationOutputSchema,
      schemaName: "segmentation_output",
    });
  },
};
