/**
 * Decision Pipeline Orchestrator
 * Structured reasoning pipeline: Problem → Structuring → Segmentation → Hypothesis → Experiment → DecisionOutput
 * Each step passes structured data. Not a chat flow.
 */

import {
  ProblemStructuringAgent,
  SegmentationAgent,
  HypothesisAgent,
  ExperimentAgent,
} from "@/lib/agents";
import type {
  ProblemStructuringInput,
  ProblemStructuringOutput,
  SegmentationOutput,
  HypothesisOutput,
  ExperimentOutput,
} from "@/lib/agents";

// ─── Pipeline Types ────────────────────────────────────────────────────────

export interface PipelineDecisionOutput {
  /** Raw problem input */
  problem: ProblemStructuringInput;
  /** Step 1: Structured problem (funnel, friction, intent mismatch) */
  structuredProblem: ProblemStructuringOutput;
  /** Step 2: User segments (behavioral, lifecycle, intent-based) */
  segments: SegmentationOutput;
  /** Step 3: Likely causes and potential solutions */
  hypotheses: HypothesisOutput;
  /** Step 4: Experiments, success metrics, expected impact */
  experiments: ExperimentOutput;
}

export type PipelineStage =
  | "structuring"
  | "segmentation"
  | "hypothesis"
  | "experiment"
  | "complete";

// ─── Pipeline ───────────────────────────────────────────────────────────────

export async function runDecisionPipeline(
  input: ProblemStructuringInput
): Promise<PipelineDecisionOutput> {
  // Step 1: Problem → Structuring
  const structuredProblem = await ProblemStructuringAgent.run(input);

  // Step 2: Structuring → Segmentation
  const segments = await SegmentationAgent.run(structuredProblem);

  // Step 3: Structuring + Segments → Hypothesis
  const hypotheses = await HypothesisAgent.run({
    structuredProblem,
    segments,
  });

  // Step 4: Hypotheses → Experiment
  const experiments = await ExperimentAgent.run(hypotheses);

  return {
    problem: input,
    structuredProblem,
    segments,
    hypotheses,
    experiments,
  };
}
