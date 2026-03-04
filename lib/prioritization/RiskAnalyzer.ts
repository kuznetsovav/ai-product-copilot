import { z } from "zod";
import type {
  EstimationResult,
  ProductStage,
  RiskTolerance,
} from "@/lib/types/prioritization";
import { generateStructured } from "@/lib/ai";
import type { Estimator } from "./Estimator";

export interface RiskAnalyzerInput {
  /**
   * Description of the experiment, including what changes, which systems
   * are touched, and who is affected.
   */
  experimentDescription: string;
  /**
   * Current product stage, used to contextualize acceptable risk.
   */
  productStage: ProductStage;
  /**
   * Organization’s overall tolerance for risk.
   */
  riskTolerance: RiskTolerance;
}

function trimToMaxWords(s: string, max: number): string {
  const words = s.trim().split(/\s+/).filter(Boolean);
  return words.length <= max ? s.trim() : words.slice(0, max).join(" ");
}

const RiskEstimationSchema = z.object({
  score: z.number().min(1).max(10),
  explanation: z.string().transform((s) => trimToMaxWords(s, 30)),
});

type RiskEstimationSchemaType = z.infer<typeof RiskEstimationSchema>;

/**
 * LLM-backed risk analyzer.
 *
 * Evaluates:
 * - technical risk (complexity, unknowns, failure modes)
 * - adoption risk (user behavior change, opt-in/opt-out, migration risk)
 * - business risk (regulatory, brand, revenue, strategic risk)
 * - reversibility (how easy it is to roll back or mitigate)
 *
 * Scores overall risk on a 1–10 scale:
 * - 1 = low risk
 * - 10 = very high risk
 */
export class RiskAnalyzer implements Estimator<RiskAnalyzerInput> {
  readonly name = "risk-analyzer-v1";

  async estimate(input: RiskAnalyzerInput): Promise<EstimationResult> {
    const { experimentDescription, productStage, riskTolerance } = input;

    const messages = [
      {
        role: "system" as const,
        content:
          "Output JSON only. No other text. Return { score: number 1-10, explanation: string max 30 words }.",
      },
      {
        role: "user" as const,
        content: `Score overall risk (1-10). 1-3 low, 4-6 moderate, 7-8 high, 9-10 very high. Product stage ${productStage}, risk tolerance ${riskTolerance}. Explanation max 30 words.\n\nExperiment: ${experimentDescription}`,
      },
    ];

    const result = await generateStructured<RiskEstimationSchemaType>({
      messages,
      schema: RiskEstimationSchema,
      schemaName: "RiskEstimationResult",
    });

    return {
      score: result.score,
      explanation: result.explanation,
    };
  }
}

