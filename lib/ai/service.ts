/**
 * AI Service Layer
 * OpenAI API with structured outputs. Agents must not return free-form text.
 * Uses JSON schema for strict output validation.
 * Responses are cached by prompt to reduce token cost on repeated requests.
 */

import type { z } from "zod";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { zodResponseFormat } from "openai/helpers/zod";
import { getOpenAIClient, DEFAULT_LLM_OPTIONS } from "./openaiClient";
import {
  buildCacheKey,
  getCached,
  setCached,
} from "./cache";

export interface GenerateStructuredOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Disable cache for this call (default false) */
  skipCache?: boolean;
}

/**
 * Generates structured output from the LLM. Returns only validated data — never free-form text.
 * Uses OpenAI JSON schema for strict output adherence.
 * Results are cached by (model, options, schemaName, messages) to avoid duplicate LLM calls.
 *
 * @throws if response is empty, invalid, or model refuses
 */
export async function generateStructured<T>(params: {
  messages: ChatCompletionMessageParam[];
  schema: z.ZodType<T>;
  schemaName: string;
  options?: GenerateStructuredOptions;
}): Promise<T> {
  const model = params.options?.model ?? DEFAULT_LLM_OPTIONS.model ?? "gpt-4o-mini";
  const temperature = params.options?.temperature ?? DEFAULT_LLM_OPTIONS.temperature ?? 0.2;
  const max_tokens = params.options?.maxTokens ?? DEFAULT_LLM_OPTIONS.maxTokens ?? 800;

  if (!params.options?.skipCache) {
    const cacheKey = buildCacheKey({
      model,
      temperature,
      maxTokens: max_tokens,
      schemaName: params.schemaName,
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
    const cached = getCached<T>(cacheKey);
    if (cached !== undefined) return cached;
  }

  const client = getOpenAIClient();

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

  const result = parsed as T;

  if (!params.options?.skipCache) {
    const cacheKey = buildCacheKey({
      model,
      temperature,
      maxTokens: max_tokens,
      schemaName: params.schemaName,
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
    setCached(cacheKey, result);
  }

  return result;
}
