/**
 * Hypothesis Agent
 * Generates likely causes and potential solutions from structured problem + segments.
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

const StructuredProblemSchema = z.object({
  funnelStage: z.string(),
  likelyFrictionPoints: z.array(z.string()),
  intentMismatch: z.object({
    userExpectation: z.string(),
    productReality: z.string(),
    gap: z.string(),
  }),
  coreQuestion: z.string().optional(),
});

const SegmentsSchema = z.object({
  behavioralSegments: z.array(SegmentSchema),
  lifecycleSegments: z.array(SegmentSchema),
  intentBasedSegments: z.array(SegmentSchema),
});

export const HypothesisInputSchema = z.object({
  structuredProblem: StructuredProblemSchema,
  segments: SegmentsSchema,
});

export type HypothesisInput = z.infer<typeof HypothesisInputSchema>;

const LikelyCauseSchema = z.object({
  id: z.string(),
  description: z.string(),
  likelihood: z.enum(["low", "medium", "high"]),
  segmentIds: z.array(z.string()).optional(),
});

const PotentialSolutionSchema = z.object({
  id: z.string(),
  description: z.string(),
  addressesCauseIds: z.array(z.string()).optional(),
  effort: z.enum(["low", "medium", "high"]).optional(),
});

export const HypothesisOutputSchema = z.object({
  likelyCauses: z.array(LikelyCauseSchema),
  potentialSolutions: z.array(PotentialSolutionSchema),
});

export type HypothesisOutput = z.infer<typeof HypothesisOutputSchema>;

// ─── Agent ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert product strategist. Your role is to generate hypotheses: likely causes of the problem and potential solutions.

Given a structured problem (funnel stage, friction points, intent mismatch) and user segments (behavioral, lifecycle, intent-based), produce:

1. likelyCauses: Root causes that could explain the problem. For each: id, description, likelihood (low/medium/high), optional segmentIds (which segments this cause most affects).
2. potentialSolutions: Actionable solutions to address the causes. For each: id, description, optional addressesCauseIds (which cause(s) it tackles), optional effort (low/medium/high).

Causes should be testable and specific. Solutions should be concrete and implementable. Link solutions to causes where relevant.`;

export const HypothesisAgent: Agent<HypothesisInput, HypothesisOutput> = {
  name: "hypothesis",
  inputSchema: HypothesisInputSchema,
  outputSchema: HypothesisOutputSchema,

  async run(input) {
    return generateStructured({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Structured problem and segments:\n${JSON.stringify(input, null, 2)}` },
      ],
      schema: HypothesisOutputSchema,
      schemaName: "hypothesis_output",
    });
  },
};
