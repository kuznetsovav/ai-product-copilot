/**
 * AI Service Layer
 * OpenAI API with structured outputs. Agents must not return free-form text.
 * Uses JSON schema for strict output validation.
 */

import type { z } from "zod";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { zodResponseFormat } from "openai/helpers/zod";
import { getOpenAIClient } from "./client";
import { DEFAULT_LLM_OPTIONS } from "./client";

export interface GenerateStructuredOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generates structured output from the LLM. Returns only validated data — never free-form text.
 * Uses OpenAI JSON schema for strict output adherence.
 *
 * @throws if response is empty, invalid, or model refuses
 */
export async function generateStructured<T>(params: {
  messages: ChatCompletionMessageParam[];
  schema: z.ZodType<T>;
  schemaName: string;
  options?: GenerateStructuredOptions;
}): Promise<T> {
  const client = getOpenAIClient();

  const model = params.options?.model ?? DEFAULT_LLM_OPTIONS.model ?? "gpt-4o-mini";
  const temperature = params.options?.temperature ?? DEFAULT_LLM_OPTIONS.temperature ?? 0.3;
  const max_tokens = params.options?.maxTokens ?? DEFAULT_LLM_OPTIONS.maxTokens ?? 4096;

  const completion = await client.beta.chat.completions.parse({
    model,
    temperature,
    max_tokens,
    messages: params.messages,
    response_format: zodResponseFormat(params.schema, params.schemaName),
  });

  const message = completion.choices[0]?.message;
  if (!message) {
    throw new Error("Empty response from LLM");
  }

  if ("refusal" in message && message.refusal) {
    throw new Error(`Model refused: ${message.refusal}`);
  }

  const parsed = message.parsed;
  if (parsed === null || parsed === undefined) {
    throw new Error("No parsed content in response");
  }

  return parsed as T;
}
