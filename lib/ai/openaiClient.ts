/**
 * OpenAI client configuration.
 * Defaults: temperature 0.2, max_tokens 800, structured JSON output.
 */

import OpenAI from "openai";

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local (see .env.example) and restart the dev server."
    );
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL,
  });
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/** Default parameters for LLM calls. Structured output (JSON) is used via generateStructured. */
export const DEFAULT_LLM_OPTIONS: LLMOptions = {
  model: "gpt-4o-mini",
  temperature: 0.2,
  maxTokens: 800,
};
