import { z } from "zod";
import type { EstimationResult } from "@/lib/types/prioritization";
import { generateStructured } from "@/lib/ai";
import type { Estimator } from "./Estimator";

export interface ConfidenceEstimatorInput {
  /**
   * Short description of the hypothesis or experiment you want to evaluate.
   */
  hypothesisDescription: string;
  /**
   * Summary of qualitative and quantitative evidence supporting the hypothesis
   * (e.g. user research, interviews, anecdotes).
   */
  evidenceSummary: string;
  /**
   * Description of any quantitative data backing the hypothesis
   * (e.g. funnels, metrics, experiment results, cohort analyses).
   */
  dataSummary: string;
  /**
   * Description of how similar this hypothesis is to past patterns or
   * previous experiments (inside or outside the product).
   */
  pastPatternsSummary: string;
}

function trimToMaxWords(s: string, max: number): string {
  const words = s.trim().split(/\s+/).filter(Boolean);
  return words.length <= max ? s.trim() : words.slice(0, max).join(" ");
}

const ConfidenceEstimationSchema = z.object({
  score: z.number().min(1).max(10),
  explanation: z.string().transform((s) => trimToMaxWords(s, 30)),
});

type ConfidenceEstimationSchemaType = z.infer<typeof ConfidenceEstimationSchema>;

/**
 * LLM-backed confidence estimator.
 *
 * Evaluates:
 * - evidence strength
 * - data backing the hypothesis
 * - similarity to past patterns
 *
 * Score: 1 = weak evidence, 10 = strong evidence.
 */
export class ConfidenceEstimator
  implements Estimator<ConfidenceEstimatorInput>
{
  readonly name = "confidence-estimator-v1";

  async estimate(input: ConfidenceEstimatorInput): Promise<EstimationResult> {
    const {
      hypothesisDescription,
      evidenceSummary,
      dataSummary,
      pastPatternsSummary,
    } = input;

    const messages = [
      {
        role: "system" as const,
        content:
          "Output JSON only. No other text. Return { score: number 1-10, explanation: string max 30 words }.",
      },
      {
        role: "user" as const,
        content: `Score confidence in hypothesis (1-10). 1-3 weak, 4-6 moderate, 7-8 strong, 9-10 very strong. Explanation max 30 words.\n\nHypothesis: ${hypothesisDescription}\nEvidence: ${evidenceSummary}\nData: ${dataSummary}\nPast patterns: ${pastPatternsSummary}`,
      },
    ];

    const result = await generateStructured<ConfidenceEstimationSchemaType>({
      messages,
      schema: ConfidenceEstimationSchema,
      schemaName: "ConfidenceEstimationResult",
    });

    return {
      score: result.score,
      explanation: result.explanation,
    };
  }
}

