/**
 * API Route: POST /api/analyze-problem
 * Input: problem description
 * Output: DecisionOutput (pipeline result)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runStructuredDecisionPipeline } from "@/lib/orchestrator";

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

    return NextResponse.json({
      success: true,
      ...decisionOutput,
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
