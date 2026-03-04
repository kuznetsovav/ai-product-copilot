/**
 * Problem Analyzer Agent
 * Transforms vague PM problem statements into structured problem definitions.
 */

import { getOpenAIClient, DEFAULT_LLM_OPTIONS } from "@/lib/ai";
import { parseStructuredOutput } from "@/lib/ai/structured-output";
import type {
  ProblemInput,
  StructuredProblem,
  AgentResponse,
} from "@/lib/types";
import { StructuredProblemSchema } from "@/lib/types";

const SYSTEM_PROMPT = `Output JSON only. No other text.

Extract from the problem: coreQuestion, keyStakeholders (array), successCriteria (array), constraints (array), assumptions (array), uncertaintyAreas (array). Include rawStatement.`;

export async function analyzeProblem(
  input: ProblemInput,
  options = DEFAULT_LLM_OPTIONS
): Promise<AgentResponse<StructuredProblem>> {
  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: options.model ?? "gpt-4o-mini",
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Problem statement:\n${input.statement}\n\n${
            input.context ? `Context:\n${input.context}\n\n` : ""
          }${input.constraints ? `Constraints:\n${input.constraints}` : ""}`,
        },
        {
          role: "user",
          content: `JSON only. Schema: {"rawStatement":"...","coreQuestion":"...","keyStakeholders":[],"successCriteria":[],"constraints":[],"assumptions":[],"uncertaintyAreas":[]}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "Empty response from LLM" };
    }

    const structured = parseStructuredOutput(content, StructuredProblemSchema);
    return { success: true, data: structured };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during problem analysis",
    };
  }
}
