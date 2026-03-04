/**
 * Orchestrator Layer
 * Decision pipeline: Input problem → UnifiedAnalysisAgent → ExperimentScoringAgent
 * → PrioritizationEngine (pure code) → DecisionOutput.
 */

export {
  runDecisionPipeline,
  runDecisionPipeline as runStructuredDecisionPipeline,
} from "./decision-pipeline";
export type {
  DecisionPipelineInput,
  DecisionOutput,
  PipelineStage,
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
 * Legacy pipeline: problem analysis → framework generation.
 * Used by decision route / actions.
 */
export async function runLegacyDecisionPipeline(
  input: ProblemInput
): Promise<OrchestratorResult> {
  const context: PipelineContext = {
    problemInput: input,
    stage: "problem_analysis",
    metadata: { startedAt: new Date().toISOString() },
  };

  const analysisResult = await analyzeProblem(input);
  if (!analysisResult.success || !analysisResult.data) {
    return {
      success: false,
      error: analysisResult.error ?? "Problem analysis failed",
    };
  }

  context.structuredProblem = analysisResult.data as StructuredProblem;
  context.stage = "framework_generation";

  const frameworkResult = await generateDecisionFramework(
    context.structuredProblem
  );
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
