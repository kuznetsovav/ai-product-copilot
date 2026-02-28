/**
 * Generic AI Agent interface for decision reasoning.
 * Agents receive structured input and return structured output — no chat text.
 */

import type { z } from "zod";

export interface Agent<TInput, TOutput> {
  /** Unique agent identifier */
  name: string;

  /** Schema for validating input */
  inputSchema: z.ZodType<TInput>;

  /** Schema for validating output */
  outputSchema: z.ZodType<TOutput>;

  /**
   * Executes the agent. Accepts structured input, returns structured output.
   * Does not produce chat or streaming text.
   */
  run(input: TInput): Promise<TOutput>;
}
