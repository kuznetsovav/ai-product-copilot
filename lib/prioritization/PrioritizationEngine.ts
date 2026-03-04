import type {
  PrioritizationContext,
  PrioritizedExperiment,
} from "@/lib/types/prioritization";
import type { ScoringModel } from "./ScoringModel";
import { computeSensitivityRange } from "./Sensitivity";
import {
  ImpactEstimator,
  type ImpactEstimatorInput,
} from "./ImpactEstimator";
import {
  EffortEstimator,
  type EffortEstimatorInput,
} from "./EffortEstimator";
import {
  RiskAnalyzer,
  type RiskAnalyzerInput,
} from "./RiskAnalyzer";
import {
  ConfidenceEstimator,
  type ConfidenceEstimatorInput,
} from "./ConfidenceEstimator";

/**
 * Minimal experiment shape required by the prioritization engine.
 * Callers can adapt their own domain models into this input.
 */
export interface PrioritizationExperimentInput {
  id: string;
  title: string;
  description: string;

  /** Scope of implementation: systems, components, integrations, etc. */
  scope: string;

  /** Hypothesis statement being tested by this experiment. */
  hypothesis: string;

  /** Qualitative/quantitative evidence summary supporting the hypothesis. */
  evidenceSummary: string;

  /** Key data backing the hypothesis (funnels, metrics, experiment reads). */
  dataSummary: string;

  /** How similar this is to past patterns or prior experiments. */
  pastPatternsSummary: string;
}

export interface PrioritizationEngineDeps {
  scoringModel: ScoringModel;
  impactEstimator?: ImpactEstimator;
  effortEstimator?: EffortEstimator;
  riskAnalyzer?: RiskAnalyzer;
  confidenceEstimator?: ConfidenceEstimator;
}

/**
 * Orchestrates the full prioritization pipeline:
 * - runs all estimators for each experiment
 * - applies the selected scoring model
 * - computes a simple sensitivity range
 * - returns a sorted list of PrioritizedExperiment objects
 */
export class PrioritizationEngine {
  private readonly impactEstimator: ImpactEstimator;
  private readonly effortEstimator: EffortEstimator;
  private readonly riskAnalyzer: RiskAnalyzer;
  private readonly confidenceEstimator: ConfidenceEstimator;

  constructor(private readonly deps: PrioritizationEngineDeps) {
    this.impactEstimator = deps.impactEstimator ?? new ImpactEstimator();
    this.effortEstimator = deps.effortEstimator ?? new EffortEstimator();
    this.riskAnalyzer = deps.riskAnalyzer ?? new RiskAnalyzer();
    this.confidenceEstimator =
      deps.confidenceEstimator ?? new ConfidenceEstimator();
  }

  async prioritize(
    experiments: PrioritizationExperimentInput[],
    context: PrioritizationContext
  ): Promise<PrioritizedExperiment[]> {
    const results: PrioritizedExperiment[] = [];

    for (const experiment of experiments) {
      const impactInput: ImpactEstimatorInput = {
        experiment: {
          id: experiment.id,
          title: experiment.title,
          description: experiment.description,
        },
        northStarMetric: context.northStarMetric,
        productStage: context.productStage,
      };

      const effortInput: EffortEstimatorInput = {
        experimentScope: experiment.scope,
        engineeringCapacity: context.engineeringCapacity,
        teamSize: context.teamSize,
      };

      const riskInput: RiskAnalyzerInput = {
        experimentDescription: experiment.description,
        productStage: context.productStage,
        riskTolerance: context.riskTolerance,
      };

      const confidenceInput: ConfidenceEstimatorInput = {
        hypothesisDescription: experiment.hypothesis,
        evidenceSummary: experiment.evidenceSummary,
        dataSummary: experiment.dataSummary,
        pastPatternsSummary: experiment.pastPatternsSummary,
      };

      // Run all estimators in parallel for this experiment
      const [impact, effort, risk, confidence] = await Promise.all([
        this.impactEstimator.estimate(impactInput),
        this.effortEstimator.estimate(effortInput),
        this.riskAnalyzer.estimate(riskInput),
        this.confidenceEstimator.estimate(confidenceInput),
      ]);

      const compositeScore = this.deps.scoringModel.compute(
        impact.score,
        effort.score,
        confidence.score,
        risk.score
      );

      const sensitivity = computeSensitivityRange(
        impact.score,
        effort.score,
        confidence.score,
        risk.score,
        this.deps.scoringModel
      );

      const reasoningParts = [
        `Impact: ${impact.explanation}`,
        `Effort: ${effort.explanation}`,
        `Risk: ${risk.explanation}`,
        `Confidence: ${confidence.explanation}`,
      ];

      results.push({
        experimentId: experiment.id,
        impactScore: impact.score,
        effortScore: effort.score,
        riskScore: risk.score,
        confidenceScore: confidence.score,
        compositeScore,
        reasoning: reasoningParts.join("\n\n"),
        sensitivityRange: sensitivity,
      });
    }

    return results.sort((a, b) => b.compositeScore - a.compositeScore);
  }
}

