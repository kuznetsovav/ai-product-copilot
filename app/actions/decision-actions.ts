"use server";

/**
 * Server Actions for PM Decision Support.
 * Invokes orchestrator and returns structured results.
 */

import { runDecisionPipeline } from "@/lib/orchestrator";
import type { ProblemInput } from "@/lib/types";

export interface DecisionActionResult {
  success: boolean;
  structuredProblem?: {
    coreQuestion: string;
    keyStakeholders: string[];
    successCriteria: string[];
    constraints: string[];
  };
  decisionFramework?: {
    problemSummary: string;
    decisionStatement: string;
    options: Array<{
      id: string;
      title: string;
      description: string;
      pros: string[];
      cons: string[];
      risks: string[];
      effort: string;
    }>;
    recommendation: {
      optionId: string;
      reasoning: string;
      confidence: number;
    };
    nextSteps: string[];
  };
  error?: string;
}

export async function processProblemDecision(
  input: ProblemInput
): Promise<DecisionActionResult> {
  const result = await runDecisionPipeline(input);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  const ctx = result.context!;
  return {
    success: true,
    structuredProblem: ctx.structuredProblem
      ? {
          coreQuestion: ctx.structuredProblem.coreQuestion,
          keyStakeholders: ctx.structuredProblem.keyStakeholders,
          successCriteria: ctx.structuredProblem.successCriteria,
          constraints: ctx.structuredProblem.constraints,
        }
      : undefined,
    decisionFramework: ctx.decisionFramework
      ? {
          problemSummary: ctx.decisionFramework.problemSummary,
          decisionStatement: ctx.decisionFramework.decisionStatement,
          options: ctx.decisionFramework.options,
          recommendation: ctx.decisionFramework.recommendation,
          nextSteps: ctx.decisionFramework.nextSteps,
        }
      : undefined,
  };
}
