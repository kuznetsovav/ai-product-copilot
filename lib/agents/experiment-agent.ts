/**
 * Experiment Agent
 * Designs experiments, success metrics, and expected impact from hypotheses.
 */

import { z } from "zod";
import { generateStructured } from "@/lib/ai/service";
import type { Agent } from "@/lib/types";

// ─── Schemas ────────────────────────────────────────────────────────────────

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

export const ExperimentInputSchema = z.object({
  likelyCauses: z.array(LikelyCauseSchema),
  potentialSolutions: z.array(PotentialSolutionSchema),
});

export type ExperimentInput = z.infer<typeof ExperimentInputSchema>;

const ExperimentSchema = z.object({
  id: z.string(),
  name: z.string(),
  design: z.string(),
  solutionId: z.string().optional(),
  causeIds: z.array(z.string()).optional(),
  duration: z.string().optional(),
});

const SuccessMetricSchema = z.object({
  id: z.string(),
  experimentId: z.string(),
  name: z.string(),
  type: z.enum(["primary", "secondary", "guardrail"]),
  definition: z.string(),
  target: z.string().optional(),
});

const ExpectedImpactSchema = z.object({
  experimentId: z.string(),
  description: z.string(),
  magnitude: z.string().optional(),
  confidence: z.enum(["low", "medium", "high"]).optional(),
});

export const ExperimentOutputSchema = z.object({
  experiments: z.array(ExperimentSchema),
  successMetrics: z.array(SuccessMetricSchema),
  expectedImpact: z.array(ExpectedImpactSchema),
});

export type ExperimentOutput = z.infer<typeof ExperimentOutputSchema>;

// ─── Agent ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert product strategist specializing in experimentation. Your role is to design experiments from hypotheses (likely causes and potential solutions).

Given hypotheses (likelyCauses, potentialSolutions), produce:

1. experiments: Testable experiments to validate solutions. For each: id, name, design (how to run it), optional solutionId (which solution it tests), optional causeIds (which causes it addresses), optional duration.
2. successMetrics: Metrics to measure experiment outcomes. For each: id, experimentId, name, type (primary/secondary/guardrail), definition, optional target. Link to experiments via experimentId.
3. expectedImpact: Expected outcome per experiment. For each: experimentId, description, optional magnitude (e.g. "10-15% uplift"), optional confidence (low/medium/high).

Designs should be specific and executable. Metrics should be measurable and tied to experiments.`;

export const ExperimentAgent: Agent<ExperimentInput, ExperimentOutput> = {
  name: "experiment",
  inputSchema: ExperimentInputSchema,
  outputSchema: ExperimentOutputSchema,

  async run(input) {
    return generateStructured({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Hypotheses:\n${JSON.stringify(input, null, 2)}` },
      ],
      schema: ExperimentOutputSchema,
      schemaName: "experiment_output",
    });
  },
};
