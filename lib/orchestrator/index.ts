/**
 * Orchestrator Layer
 * Coordinates agents and pipeline stages to produce end-to-end decision support.
 */

export {
  runDecisionPipeline as runStructuredDecisionPipeline,
  type PipelineDecisionOutput,
  type PipelineStage,
} from "./decision-pipeline";

import { analyzeProblem } from "@/lib/agents/problem-analyzer";
import { generateDecisionFramework } from "@/lib/agents/decision-framework-agent";
import type {
  ProblemInput,
  PipelineContext,
  StructuredProblem,
  DecisionFramework,
} from "@/lib/types";

export interface OrchestratorResult {
  success: boolean;
  context?: PipelineContext;
  error?: string;
}

/**
 * Runs the full decision-support pipeline: problem analysis → framework generation.
 */
export async function runDecisionPipeline(input: ProblemInput): Promise<OrchestratorResult> {
  const context: PipelineContext = {
    problemInput: input,
    stage: "problem_analysis",
    metadata: { startedAt: new Date().toISOString() },
  };

  // Stage 1: Problem Analysis
  const analysisResult = await analyzeProblem(input);
  if (!analysisResult.success || !analysisResult.data) {
    return {
      success: false,
      error: analysisResult.error ?? "Problem analysis failed",
    };
  }

  context.structuredProblem = analysisResult.data as StructuredProblem;
  context.stage = "framework_generation";

  // Stage 2: Decision Framework
  const frameworkResult = await generateDecisionFramework(context.structuredProblem);
  if (!frameworkResult.success || !frameworkResult.data) {
    return {
      success: false,
      error: frameworkResult.error ?? "Framework generation failed",
      context,
    };
  }

  context.decisionFramework = frameworkResult.data as DecisionFramework;
  context.stage = "complete";
  context.metadata = {
    ...context.metadata,
    completedAt: new Date().toISOString(),
  };

  return { success: true, context };
}
