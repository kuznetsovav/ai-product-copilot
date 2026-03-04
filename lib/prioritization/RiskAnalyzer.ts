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

const RiskEstimationSchema = z.object({
  score: z.number().min(1).max(10),
  explanation: z.string(),
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

    const rubric = `
You are evaluating the *overall risk* of a product experiment on a 1–10 scale.

You MUST consider:
- technical risk: implementation complexity, dependencies, failure modes, data integrity
- adoption risk: user understanding, opt-in/opt-out paths, migration or change management
- business risk: legal/regulatory, brand, revenue, strategic positioning
- reversibility: ease of rollback, kill switches, ability to mitigate impact quickly

Context:
- Product stage: ${productStage}
- Organization risk tolerance: ${riskTolerance}

Scoring (use whole numbers only):
- 1–3  = low risk
- 4–6  = moderate risk
- 7–8  = high risk
- 9–10 = very high risk

Higher scores mean more overall risk across these dimensions, adjusted for the given
product stage and risk tolerance.
`.trim();

    const description = `
Experiment:
${experimentDescription}
`.trim();

    const messages = [
      {
        role: "system" as const,
        content:
          "You are a risk analysis engine. You must respond only with structured JSON that matches the given schema. Do not use markdown.",
      },
      {
        role: "user" as const,
        content: `${rubric}\n\n${description}`,
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

