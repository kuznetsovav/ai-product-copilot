export type ProductStage = "early" | "growth" | "scale";

export type RiskTolerance = "low" | "medium" | "high";

export interface PrioritizationContext {
  northStarMetric: string;
  productStage: ProductStage;
  teamSize: number;
  /**
   * Relative engineering capacity, e.g. number of engineers or normalized capacity score.
   */
  engineeringCapacity: number;
  riskTolerance: RiskTolerance;
}

export interface SensitivityRange {
  minScore: number;
  maxScore: number;
}

export interface PrioritizedExperiment {
  experimentId: string;
  impactScore: number;
  effortScore: number;
  riskScore: number;
  confidenceScore: number;
  /**
   * Final composite prioritization score after combining dimensions.
   */
  compositeScore: number;
  /**
   * Human-readable or model-generated explanation of why this experiment
   * received its scores and rank.
   */
  reasoning: string;
  sensitivityRange?: SensitivityRange;
}

/**
 * Generic estimation result for a single dimension or composite measure.
 * `score` is expected to be on a 1–10 scale.
 */
export interface EstimationResult {
  score: number;
  explanation: string;
}

