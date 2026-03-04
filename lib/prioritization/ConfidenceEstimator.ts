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

const ConfidenceEstimationSchema = z.object({
  score: z.number().min(1).max(10),
  explanation: z.string(),
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

    const rubric = `
You are evaluating the *confidence* in a product hypothesis on a 1–10 scale.

You MUST consider:
- evidence strength: quality, recency, and directness of supporting evidence
- data backing the hypothesis: analytical depth, sample size, statistical strength
- similarity to past patterns: how closely this aligns with known wins or failures

Scoring (use whole numbers only):
- 1–3  = very weak evidence (speculation, anecdotes, or conflicting signals)
- 4–6  = moderate evidence (some data and/or research, but gaps or uncertainty remain)
- 7–8  = strong evidence (multiple consistent sources, good data quality, clear pattern)
- 9–10 = very strong evidence (robust data, repeated patterns, high certainty)

Higher scores mean stronger overall confidence given the available evidence and data.
`.trim();

    const description = `
Hypothesis:
${hypothesisDescription}

Evidence:
${evidenceSummary}

Data backing hypothesis:
${dataSummary}

Similarity to past patterns:
${pastPatternsSummary}
`.trim();

    const messages = [
      {
        role: "system" as const,
        content:
          "You are a confidence estimation engine. You must respond only with structured JSON that matches the given schema. Do not use markdown.",
      },
      {
        role: "user" as const,
        content: `${rubric}\n\n${description}`,
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

