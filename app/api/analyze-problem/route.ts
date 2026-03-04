/**
 * API Route: POST /api/analyze-problem
 * Input: problem (or description), optional context (string or { northStarMetric?, productStage? })
 * Output: DecisionOutput + legacy-compatible shape for existing UI
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runStructuredDecisionPipeline } from "@/lib/orchestrator";

const AnalyzeProblemInputSchema = z.object({
  problem: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  context: z.union([
    z.string(),
    z.object({
      northStarMetric: z.string().optional(),
      productStage: z.string().optional(),
    }),
  ]).optional(),
}).refine((data) => data.problem ?? data.description, {
  message: "problem or description is required",
});

/** Map pipeline DecisionOutput to legacy DashboardData shape for existing UI. */
function toLegacyResponseShape(
  decisionOutput: {
    problem: string;
    analysis: {
      problem_summary: string;
      segments: Array<{ name: string; description: string }>;
      root_causes: Array<{ cause: string; explanation: string }>;
      hypotheses: Array<{ hypothesis: string }>;
      experiments: Array<{ id: string; title: string; description: string }>;
    };
    prioritizedExperiments: Array<unknown>;
  },
  requestContext?: string
) {
  const { problem, analysis, prioritizedExperiments } = decisionOutput;
  return {
    problem: {
      description: problem,
      context: requestContext,
    },
    structuredProblem: {
      funnelStage: "unknown",
      likelyFrictionPoints: analysis.problem_summary
        ? [analysis.problem_summary.slice(0, 200)]
        : [],
      intentMismatch: {
        userExpectation: "",
        productReality: "",
        gap: analysis.problem_summary ?? "",
      },
    },
    segments: {
      behavioralSegments: analysis.segments.map((s, i) => ({
        id: `seg-${i}`,
        name: s.name,
        description: s.description,
        criteria: [],
      })),
      lifecycleSegments: [],
      intentBasedSegments: [],
    },
    hypotheses: {
      likelyCauses: analysis.root_causes.map((c, i) => ({
        id: `cause-${i}`,
        description: `${c.cause}: ${c.explanation}`,
        likelihood: "medium" as const,
      })),
      potentialSolutions: [],
    },
    experiments: {
      experiments: analysis.experiments.map((e) => ({
        id: e.id,
        name: e.title,
        design: e.description,
      })),
      successMetrics: [],
      expectedImpact: analysis.experiments.map((e) => ({
        experimentId: e.id,
        description: e.description,
      })),
    },
    prioritizedExperiments,
  };
}

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

    const { problem, description, context } = parsed.data;
    const problemText = problem ?? description!;
    const contextObj =
      context && typeof context === "object"
        ? context
        : undefined;

    const decisionOutput = await runStructuredDecisionPipeline({
      problem: problemText,
      context: contextObj,
    });

    const requestContextStr =
      typeof context === "string" ? context : undefined;
    const legacy = toLegacyResponseShape(decisionOutput, requestContextStr);
    return NextResponse.json({
      success: true,
      ...decisionOutput,
      ...legacy,
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
