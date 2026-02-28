/**
 * Pipeline Layer
 * Defines and runs sequential stages for decision support.
 * Extensible for future stages (e.g., memory retrieval, validation).
 */

import type { PipelineContext, PipelineStage } from "@/lib/types";

export interface PipelineStageHandler {
  stage: PipelineStage;
  execute: (context: PipelineContext) => Promise<Partial<PipelineContext>>;
}

/**
 * Future: Register custom stage handlers for extensibility.
 * Example: add memory retrieval before problem analysis.
 */
export const pipelineStages: PipelineStage[] = [
  "problem_analysis",
  "framework_generation",
  "recommendation",
  "complete",
];
