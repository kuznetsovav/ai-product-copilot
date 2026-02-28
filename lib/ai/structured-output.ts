/**
 * Utilities for extracting structured outputs from LLM responses.
 * Uses JSON mode and schema validation.
 */

import { z } from "zod";

export function parseStructuredOutput<T>(raw: string, schema: z.ZodSchema<T>): T {
  try {
    const parsed = JSON.parse(raw);
    return schema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Schema validation failed: ${error.errors.map((e) => e.message).join(", ")}`);
    }
    throw new Error(`Failed to parse structured output: ${String(error)}`);
  }
}

export function buildStructuredOutputPrompt(schemaDescription: string, example?: string): string {
  return `You must respond with valid JSON only. No markdown, no explanation outside the JSON.
${schemaDescription}
${example ? `Example format:\n${example}` : ""}`;
}
