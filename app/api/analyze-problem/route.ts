/**
 * API Route: POST /api/analyze-problem
 * Input: problem description
 * Output: DecisionOutput (pipeline result)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runStructuredDecisionPipeline } from "@/lib/orchestrator";
import type {
  PrioritizationContext,
  PrioritizedExperiment,
} from "@/lib/types/prioritization";
import {
  PrioritizationEngine,
  type PrioritizationExperimentInput,
} from "@/lib/prioritization/PrioritizationEngine";
import { RiceModel } from "@/lib/prioritization/ScoringModel";

const AnalyzeProblemInputSchema = z.object({
  description: z.string().min(1, "Problem description is required"),
  context: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AnalyzeProblemInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const decisionOutput = await runStructuredDecisionPipeline(parsed.data);

    let prioritizedExperiments: PrioritizedExperiment[] | null = null;
    let prioritizationError: string | null = null;

    try {
      const engine = new PrioritizationEngine({
        scoringModel: new RiceModel(),
      });

      const funnelStage =
        decisionOutput.structuredProblem?.funnelStage ?? "unknown";

      const northStarMetric = (() => {
        switch (funnelStage) {
          case "awareness":
            return "top-of-funnel reach";
          case "consideration":
            return "consideration-to-signup rate";
          case "conversion":
            return "signup conversion rate";
          case "activation":
            return "activation rate";
          case "retention":
            return "retention / DAU/MAU";
          case "expansion":
            return "expansion revenue";
          case "advocacy":
            return "referral / NPS-driven growth";
          default:
            return "primary product north star metric";
        }
      })();

      const context: PrioritizationContext = {
        northStarMetric,
        productStage: "growth",
        teamSize: 8,
        engineeringCapacity: 5,
        riskTolerance: "medium",
      };

      const { experiments, hypotheses, structuredProblem } =
        decisionOutput;

      const causesById = new Map(
        hypotheses.likelyCauses.map((c) => [c.id, c])
      );
      const solutionsById = new Map(
        hypotheses.potentialSolutions.map((s) => [s.id, s])
      );
      const expectedImpactByExperiment = new Map(
        experiments.expectedImpact.map((ei) => [ei.experimentId, ei])
      );

      const prioritizedInput: PrioritizationExperimentInput[] =
        experiments.experiments.map((exp) => {
          const linkedCauses =
            exp.causeIds?.map((id) => causesById.get(id)?.description ?? id) ??
            [];

          const solution = exp.solutionId
            ? solutionsById.get(exp.solutionId)
            : undefined;

          const expectedImpact = expectedImpactByExperiment.get(exp.id);
          const expectedImpactParts: string[] = [];
          if (expectedImpact?.description) {
            expectedImpactParts.push(expectedImpact.description);
          }
          if (expectedImpact?.magnitude) {
            expectedImpactParts.push(`Magnitude: ${expectedImpact.magnitude}`);
          }
          if (expectedImpact?.confidence) {
            expectedImpactParts.push(
              `Confidence: ${expectedImpact.confidence}`
            );
          }

          const hypothesisLines: string[] = [];
          if (solution?.description) {
            hypothesisLines.push(`Solution: ${solution.description}`);
          }
          if (linkedCauses.length > 0) {
            hypothesisLines.push(
              `Addresses causes: ${linkedCauses.join("; ")}`
            );
          }
          if (expectedImpactParts.length > 0) {
            hypothesisLines.push(
              `Expected impact: ${expectedImpactParts.join(" | ")}`
            );
          }
          if (hypothesisLines.length === 0) {
            hypothesisLines.push(
              `Hypothesis derived from problem gap: ${structuredProblem.intentMismatch.gap}`
            );
          }

          const frictionPreview =
            structuredProblem.likelyFrictionPoints.slice(0, 3).join("; ");

          const evidenceSummary = [
            frictionPreview &&
              `Friction points: ${frictionPreview}`,
            linkedCauses.length > 0 &&
              `Root causes considered: ${linkedCauses.length}`,
          ]
            .filter(Boolean)
            .join(" | ");

          const dataSummary =
            "Decision support is based on structured reasoning from the problem description; no historical experiment data was provided.";

          const pastPatternsSummary =
            "Similarity to past patterns is inferred qualitatively from funnel stage and causes; no explicit prior experiment catalog was provided.";

          const scopeLines: string[] = [
            `Design: ${exp.design}`,
          ];
          if (exp.duration) {
            scopeLines.push(`Duration: ${exp.duration}`);
          }
          if (solution?.id) {
            scopeLines.push(`Linked solution: ${solution.id}`);
          }

          return {
            id: exp.id,
            title: exp.name,
            description: exp.design,
            scope: scopeLines.join("\n"),
            hypothesis: hypothesisLines.join("\n"),
            evidenceSummary,
            dataSummary,
            pastPatternsSummary,
          };
        });

      prioritizedExperiments =
        prioritizedInput.length > 0
          ? await engine.prioritize(prioritizedInput, context)
          : [];
    } catch (err) {
      prioritizationError =
        err instanceof Error ? err.message : "Prioritization failed";
    }

    return NextResponse.json({
      success: true,
      ...decisionOutput,
      prioritizedExperiments,
      prioritizationError: prioritizationError ?? undefined,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Pipeline failed",
      },
      { status: 500 }
    );
  }
}
