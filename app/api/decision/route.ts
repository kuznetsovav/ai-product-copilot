/**
 * API Route: POST /api/decision
 * Accepts problem input, returns structured decision framework.
 */

import { NextRequest, NextResponse } from "next/server";
import { runDecisionPipeline } from "@/lib/orchestrator";
import { ProblemInputSchema } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ProblemInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const result = await runDecisionPipeline(parsed.data);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      structuredProblem: result.context?.structuredProblem,
      decisionFramework: result.context?.decisionFramework,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
