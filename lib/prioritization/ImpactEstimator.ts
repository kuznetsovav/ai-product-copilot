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

const ImpactEstimationSchema = z.object({
  score: z.number().min(1).max(10),
  explanation: z.string(),
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

    const rubric = `
You are scoring the *impact* of a single product experiment on a 1–10 scale.

Scoring rubric (use whole numbers only):
- 1–3: marginal impact (small, local improvement, barely moves ${northStarMetric})
- 4–6: moderate improvement (meaningful but not game-changing movement in ${northStarMetric})
- 7–8: strong improvement (clearly moves ${northStarMetric} in a major way for the ${productStage} stage)
- 9–10: transformative (step-change impact on ${northStarMetric}, reshapes the trajectory at the ${productStage} stage)

Consider:
- How directly the experiment influences ${northStarMetric}
- The breadth of users/segments affected
- Whether the effect compounds over time
- Whether the impact is appropriate for a ${productStage} product.
`.trim();

    const description = `
Experiment:
- ID: ${experiment.id}
- Title: ${experiment.title}
- Description: ${experiment.description}
`.trim();

    const messages = [
      {
        role: "system" as const,
        content:
          "You are an impact estimation engine. You must respond only with structured JSON that matches the given schema. Do not use markdown.",
      },
      {
        role: "user" as const,
        content: `${rubric}\n\n${description}`,
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

