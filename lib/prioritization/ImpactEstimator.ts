import { z } from "zod";
import type { EstimationResult, ProductStage } from "@/lib/types/prioritization";
import { generateStructured } from "@/lib/ai";
import type { Estimator } from "./Estimator";

export interface ImpactEstimatorInput {
  experiment: {
    id: string;
    title: string;
    description: string;
  };
  northStarMetric: string;
  productStage: ProductStage;
}

function trimToMaxWords(s: string, max: number): string {
  const words = s.trim().split(/\s+/).filter(Boolean);
  return words.length <= max ? s.trim() : words.slice(0, max).join(" ");
}

const ImpactEstimationSchema = z.object({
  score: z.number().min(1).max(10),
  explanation: z.string().transform((s) => trimToMaxWords(s, 30)),
});

type ImpactEstimationSchemaType = z.infer<typeof ImpactEstimationSchema>;

/**
 * LLM-backed impact estimator.
 *
 * - Uses OpenAI structured output (JSON schema via zod)
 * - Applies a fixed 1–10 scoring rubric for impact
 * - Returns only an EstimationResult (no chat-style text)
 */
export class ImpactEstimator
  implements Estimator<ImpactEstimatorInput>
{
  readonly name = "impact-estimator-v1";

  async estimate(input: ImpactEstimatorInput): Promise<EstimationResult> {
    const { experiment, northStarMetric, productStage } = input;

    const messages = [
      {
        role: "system" as const,
        content:
          "Output JSON only. No other text. Return { score: number 1-10, explanation: string max 30 words }.",
      },
      {
        role: "user" as const,
        content: `Score impact (1-10) on ${northStarMetric} for ${productStage}. 1-3 marginal, 4-6 moderate, 7-8 strong, 9-10 transformative. Explanation max 30 words.\n\nExperiment: ${experiment.id} / ${experiment.title}\n${experiment.description}`,
      },
    ];

    const result = await generateStructured<ImpactEstimationSchemaType>({
      messages,
      schema: ImpactEstimationSchema,
      schemaName: "ImpactEstimationResult",
    });

    return {
      score: result.score,
      explanation: result.explanation,
    };
  }
}

