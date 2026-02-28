/**
 * Problem Structuring Agent
 * Transforms vague PM problem descriptions into structured product problems.
 * Outputs: funnel stage, likely friction points, intent mismatch.
 */

import { z } from "zod";
import { generateStructured } from "@/lib/ai/service";
import type { Agent } from "@/lib/types";

// ─── Schemas ────────────────────────────────────────────────────────────────

export const ProblemStructuringInputSchema = z.object({
  description: z.string().min(1, "Problem description is required"),
  context: z.string().optional(),
});

export type ProblemStructuringInput = z.infer<typeof ProblemStructuringInputSchema>;

export const FunnelStageSchema = z.enum([
  "awareness",
  "consideration",
  "conversion",
  "activation",
  "retention",
  "expansion",
  "advocacy",
  "unknown",
]);

export const ProblemStructuringOutputSchema = z.object({
  funnelStage: FunnelStageSchema,
  likelyFrictionPoints: z.array(z.string()),
  intentMismatch: z.object({
    userExpectation: z.string(),
    productReality: z.string(),
    gap: z.string(),
  }),
});

export type ProblemStructuringOutput = z.infer<typeof ProblemStructuringOutputSchema>;

// ─── Agent ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert product strategist. Your role is to transform vague PM problem descriptions into structured product problems.

Given a raw problem description, extract:
1. funnelStage: Where in the user journey this problem occurs. Use: awareness, consideration, conversion, activation, retention, expansion, advocacy, or unknown.
2. likelyFrictionPoints: Specific points where users likely hit friction (e.g. "confusing pricing page", "too many steps before value").
3. intentMismatch: The gap between what users expect and what the product delivers.
   - userExpectation: What the user came to do or expected
   - productReality: What the product actually offers or does
   - gap: The specific mismatch

Be precise. Avoid generic answers. Focus on product and UX.`;

export const ProblemStructuringAgent: Agent<
  ProblemStructuringInput,
  ProblemStructuringOutput
> = {
  name: "problem-structuring",
  inputSchema: ProblemStructuringInputSchema,
  outputSchema: ProblemStructuringOutputSchema,

  async run(input) {
    return generateStructured({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Problem description:\n${input.description}\n\n${
            input.context ? `Context:\n${input.context}` : ""
          }`,
        },
      ],
      schema: ProblemStructuringOutputSchema,
      schemaName: "problem_structuring_output",
    });
  },
};
