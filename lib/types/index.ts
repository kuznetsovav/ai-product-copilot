/**
 * Core type definitions for the PM Decision Support System.
 * Structures used across agents, orchestrator, and pipeline.
 */

import { z } from "zod";

// ─── Problem & Decision Schemas ────────────────────────────────────────────

/** Raw input from PM - vague problem statement */
export const ProblemInputSchema = z.object({
  statement: z.string().min(1, "Problem statement is required"),
  context: z.string().optional(),
  constraints: z.string().optional(),
});

export type ProblemInput = z.infer<typeof ProblemInputSchema>;

/** Structured problem after analysis */
export const StructuredProblemSchema = z.object({
  id: z.string().optional(),
  rawStatement: z.string(),
  coreQuestion: z.string(),
  keyStakeholders: z.array(z.string()),
  successCriteria: z.array(z.string()),
  constraints: z.array(z.string()),
  assumptions: z.array(z.string()),
  uncertaintyAreas: z.array(z.string()),
});

export type StructuredProblem = z.infer<typeof StructuredProblemSchema>;

/** Decision option to consider */
export const DecisionOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  risks: z.array(z.string()),
  effort: z.enum(["low", "medium", "high", "unknown"]),
});

export type DecisionOption = z.infer<typeof DecisionOptionSchema>;

/** Full decision framework output */
export const DecisionFrameworkSchema = z.object({
  problemSummary: z.string(),
  decisionStatement: z.string(),
  options: z.array(DecisionOptionSchema),
  recommendation: z.object({
    optionId: z.string(),
    reasoning: z.string(),
    confidence: z.number().min(0).max(1),
  }),
  nextSteps: z.array(z.string()),
});

export type DecisionFramework = z.infer<typeof DecisionFrameworkSchema>;

// ─── Pipeline & Agent Types ────────────────────────────────────────────────

export type PipelineStage =
  | "problem_analysis"
  | "framework_generation"
  | "recommendation"
  | "complete";

export interface PipelineContext {
  problemInput: ProblemInput;
  structuredProblem?: StructuredProblem;
  decisionFramework?: DecisionFramework;
  stage: PipelineStage;
  metadata?: Record<string, unknown>;
}

export interface AgentResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Agent Interface ────────────────────────────────────────────────────────

export type { Agent } from "./agent";

// ─── Product Decision Domain Models ─────────────────────────────────────────
// See product-decision.ts for full flow: problem → causes → segments → hypotheses → experiments → metrics

export {
  type ProductProblem,
  type Cause,
  type StructuredProblem as StructuredProductProblem,
  type UserSegment,
  type Hypothesis,
  type Experiment,
  type Metric,
  type DecisionOutput,
} from "./product-decision";
