/**
 * Decision Pipeline
 * Input problem → UnifiedAnalysisAgent → ExperimentScoringAgent → PrioritizationEngine (pure code) → DecisionOutput
 */

import { UnifiedAnalysisAgent } from "@/lib/agents/UnifiedAnalysisAgent";
import { ExperimentScoringAgent } from "@/lib/agents/ExperimentScoringAgent";
import type { UnifiedAnalysisInput, UnifiedAnalysisOutput } from "@/lib/agents";
import type { PrioritizationContext } from "@/lib/types/prioritization";
import type { PrioritizedExperiment } from "@/lib/types/prioritization";
import type { PrioritizationExperimentInput } from "@/lib/prioritization/PrioritizationEngine";
import { PrioritizationEngine } from "@/lib/prioritization/PrioritizationEngine";
import type { PrecomputedScores } from "@/lib/prioritization/PrioritizationEngine";

// ─── Pipeline types ─────────────────────────────────────────────────────────

export interface DecisionPipelineInput {
  problem: string;
  context?: {
    northStarMetric?: string;
    productStage?: string;
  };
}

export interface DecisionOutput {
  problem: string;
  analysis: UnifiedAnalysisOutput;
  prioritizedExperiments: PrioritizedExperiment[];
}

export type PipelineStage =
  | "analysis"
  | "scoring"
  | "prioritization"
  | "complete";

const DEFAULT_PRIORITIZATION_CONTEXT: PrioritizationContext = {
  northStarMetric: "primary product north star metric",
  productStage: "growth",
  teamSize: 8,
  engineeringCapacity: 5,
  riskTolerance: "medium",
};

function buildPrioritizationContext(
  input: DecisionPipelineInput
): PrioritizationContext {
  const ctx = input.context;
  return {
    northStarMetric:
      ctx?.northStarMetric ?? DEFAULT_PRIORITIZATION_CONTEXT.northStarMetric,
    productStage:
      (ctx?.productStage as PrioritizationContext["productStage"]) ??
      DEFAULT_PRIORITIZATION_CONTEXT.productStage,
    teamSize: DEFAULT_PRIORITIZATION_CONTEXT.teamSize,
    engineeringCapacity: DEFAULT_PRIORITIZATION_CONTEXT.engineeringCapacity,
    riskTolerance: DEFAULT_PRIORITIZATION_CONTEXT.riskTolerance,
  };
}

function analysisToPrioritizationInput(
  analysis: UnifiedAnalysisOutput
): PrioritizationExperimentInput[] {
  const rootCauseSummary =
    analysis.root_causes.length > 0
      ? analysis.root_causes.map((r) => `${r.cause}: ${r.explanation}`).join(" | ")
      : "No root causes identified.";
  const hypothesisSummary =
    analysis.hypotheses.length > 0
      ? analysis.hypotheses.map((h) => h.hypothesis).join(" | ")
      : analysis.problem_summary;

  return analysis.experiments.map((exp) => ({
    id: exp.id,
    title: exp.title,
    description: exp.description,
    scope: exp.description,
    hypothesis: hypothesisSummary,
    evidenceSummary: rootCauseSummary,
    dataSummary:
      "Decision support from problem description; no historical experiment data.",
    pastPatternsSummary:
      "Inferred from problem and root causes; no prior experiment catalog.",
  }));
}

/**
 * Runs the decision pipeline:
 * 1. UnifiedAnalysisAgent (single LLM call)
 * 2. ExperimentScoringAgent (single LLM call for all experiment scores)
 * 3. PrioritizationEngine (pure code: composite score, sensitivity, ranking)
 */
export async function runDecisionPipeline(
  input: DecisionPipelineInput
): Promise<DecisionOutput> {
  // Step 1: Unified analysis
  const analysis = await UnifiedAnalysisAgent.run({
    problem: input.problem,
    context: input.context,
  });

  const prioritizationContext = buildPrioritizationContext(input);

  // Step 2: Experiment scoring (single LLM call)
  const scoringOutput = await ExperimentScoringAgent.run({
    experiments: analysis.experiments.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
    })),
    context: prioritizationContext,
  });

  const scoresMap = new Map<string, PrecomputedScores>();
  for (const s of scoringOutput.scores) {
    scoresMap.set(s.experimentId, {
      impactScore: s.impact,
      effortScore: s.effort,
      riskScore: s.risk,
      confidenceScore: s.confidence,
      impactExplanation: s.reasoning,
    });
  }

  // Step 3: Prioritization (pure code)
  const prioritizationInput = analysisToPrioritizationInput(analysis);
  const engine = new PrioritizationEngine();
  const prioritizedExperiments =
    prioritizationInput.length > 0
      ? engine.prioritizeWithPrecomputedScores(
          prioritizationInput,
          prioritizationContext,
          scoresMap
        )
      : [];

  return {
    problem: input.problem,
    analysis,
    prioritizedExperiments,
  };
}
