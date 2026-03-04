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

const EffortEstimationSchema = z.object({
  score: z.number().min(1).max(10),
  explanation: z.string(),
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

    const rubric = `
You are estimating *implementation effort* for a product experiment on a 1–10 scale.

Scoring rubric (use whole numbers only):
- 1–3: small UI tweak (very limited scope, minimal risk, can be shipped quickly)
- 4–6: moderate backend work (non-trivial changes to APIs, data models, or jobs)
- 7–8: cross-functional change (meaningful coordination across multiple teams or surfaces)
- 9–10: large infra or architecture change (deep platform work, migrations, or risky refactors)

Consider:
- Breadth and depth of systems/components touched
- Need for data migrations or backfills
- Coordination complexity across teams
- How the estimated effort relates to the available engineering capacity (${engineeringCapacity}) and team size (${teamSize}).
`.trim();

    const description = `
Experiment scope:
${experimentScope}
`.trim();

    const messages = [
      {
        role: "system" as const,
        content:
          "You are an effort estimation engine. You must respond only with structured JSON that matches the given schema. Do not use markdown.",
      },
      {
        role: "user" as const,
        content: `${rubric}\n\n${description}`,
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

