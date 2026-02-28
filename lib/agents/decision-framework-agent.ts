/**
 * Decision Framework Agent
 * Generates decision options and recommendation from a structured problem.
 */

import { getOpenAIClient, DEFAULT_LLM_OPTIONS } from "@/lib/ai";
import { parseStructuredOutput } from "@/lib/ai/structured-output";
import type {
  StructuredProblem,
  DecisionFramework,
  AgentResponse,
} from "@/lib/types";
import { DecisionFrameworkSchema } from "@/lib/types";

const SYSTEM_PROMPT = `You are an expert product strategist specializing in decision frameworks.

Given a structured problem, produce:
1. A crisp decision statement (what we're deciding)
2. 2-5 distinct options with pros, cons, risks, effort
3. A clear recommendation with reasoning and confidence (0-1)
4. Concrete next steps

Options should be actionable and distinct. Effort: low/medium/high/unknown.`;

export async function generateDecisionFramework(
  problem: StructuredProblem,
  options = DEFAULT_LLM_OPTIONS
): Promise<AgentResponse<DecisionFramework>> {
  try {
    const client = getOpenAIClient();
    const problemJson = JSON.stringify(problem, null, 2);
    const response = await client.chat.completions.create({
      model: options.model ?? "gpt-4o-mini",
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Structured problem:\n${problemJson}`,
        },
        {
          role: "user",
          content: `Respond with JSON only. Schema: {"problemSummary":"...","decisionStatement":"...","options":[{"id":"A","title":"...","description":"...","pros":[],"cons":[],"risks":[],"effort":"medium"}],"recommendation":{"optionId":"A","reasoning":"...","confidence":0.8},"nextSteps":[]}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "Empty response from LLM" };
    }

    const framework = parseStructuredOutput(content, DecisionFrameworkSchema);
    return { success: true, data: framework };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error during framework generation",
    };
  }
}
