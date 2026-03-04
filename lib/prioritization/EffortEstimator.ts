import { z } from "zod";
import type { EstimationResult } from "@/lib/types/prioritization";
import { generateStructured } from "@/lib/ai";
import type { Estimator } from "./Estimator";

export interface EffortEstimatorInput {
  /**
   * Text description of the scope of the experiment:
   * systems touched, components, integrations, data migrations, etc.
   */
  experimentScope: string;
  /**
   * Relative engineering capacity available (e.g. number of engineers
   * or a normalized capacity index).
   */
  engineeringCapacity: number;
  /**
   * Total team size involved in delivery (engineering + cross-functional).
   */
  teamSize: number;
}

function trimToMaxWords(s: string, max: number): string {
  const words = s.trim().split(/\s+/).filter(Boolean);
  return words.length <= max ? s.trim() : words.slice(0, max).join(" ");
}

const EffortEstimationSchema = z.object({
  score: z.number().min(1).max(10),
  explanation: z.string().transform((s) => trimToMaxWords(s, 30)),
});

type EffortEstimationSchemaType = z.infer<typeof EffortEstimationSchema>;

/**
 * LLM-backed effort estimator.
 *
 * - Uses OpenAI structured output (JSON via zod schema)
 * - Scores perceived effort on a 1–10 scale
 * - Returns only an EstimationResult (no free-form chat text)
 */
export class EffortEstimator implements Estimator<EffortEstimatorInput> {
  readonly name = "effort-estimator-v1";

  async estimate(input: EffortEstimatorInput): Promise<EstimationResult> {
    const { experimentScope, engineeringCapacity, teamSize } = input;

    const messages = [
      {
        role: "system" as const,
        content:
          "Output JSON only. No other text. Return { score: number 1-10, explanation: string max 30 words }.",
      },
      {
        role: "user" as const,
        content: `Score implementation effort (1-10). 1-3 small, 4-6 moderate, 7-8 cross-functional, 9-10 large/infra. Capacity ${engineeringCapacity}, team ${teamSize}. Explanation max 30 words.\n\nScope: ${experimentScope}`,
      },
    ];

    const result = await generateStructured<EffortEstimationSchemaType>({
      messages,
      schema: EffortEstimationSchema,
      schemaName: "EffortEstimationResult",
    });

    return {
      score: result.score,
      explanation: result.explanation,
    };
  }
}

