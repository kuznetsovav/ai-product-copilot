import type { EstimationResult } from "@/lib/types/prioritization";

/**
 * Generic estimator interface for the Prioritization Engine.
 *
 * - Receives a strongly-typed structured input `TInput`
 * - Returns a structured `EstimationResult`
 * - Does not return or depend on free-form chat text
 */
export interface Estimator<TInput> {
  /** Human-readable name or identifier for this estimator implementation. */
  name: string;

  /**
   * Compute a structured estimation result from the given input.
   */
  estimate(input: TInput): Promise<EstimationResult>;
}

