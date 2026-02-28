/**
 * Domain models for the Product Decision System.
 * Flow: problem → causes → segments → hypotheses → experiments → metrics
 */

// ─── Product Problem ───────────────────────────────────────────────────────

/** Raw product problem input from a PM */
export interface ProductProblem {
  id: string;
  statement: string;
  context?: string;
  constraints?: string[];
  reportedAt: string; // ISO 8601
}

// ─── Cause ────────────────────────────────────────────────────────────────

/** A potential cause of the product problem */
export interface Cause {
  id: string;
  description: string;
  likelihood: "low" | "medium" | "high" | "unknown";
  evidence?: string;
}

// ─── Structured Problem ────────────────────────────────────────────────────

/** Problem structured with identified causes */
export interface StructuredProblem {
  id: string;
  productProblemId: string;
  coreQuestion: string;
  causes: Cause[];
  keyStakeholders: string[];
  successCriteria: string[];
}

// ─── User Segment ──────────────────────────────────────────────────────────

/** User segment affected by or relevant to the problem */
export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: string[]; // e.g. ["Active users", "Free tier only"]
  problemRelevance: "primary" | "secondary" | "exploratory";
}

// ─── Hypothesis ─────────────────────────────────────────────────────────────

/** Testable hypothesis derived from causes and segments */
export interface Hypothesis {
  id: string;
  statement: string;
  causeId: string;
  segmentIds: string[];
  priority: "P0" | "P1" | "P2";
}

// ─── Experiment ────────────────────────────────────────────────────────────

/** Experiment to validate a hypothesis */
export interface Experiment {
  id: string;
  hypothesisId: string;
  name: string;
  design: string;
  duration?: string;
  status: "planned" | "running" | "completed" | "cancelled";
}

// ─── Metric ───────────────────────────────────────────────────────────────

/** Metric measured in an experiment */
export interface Metric {
  id: string;
  experimentId: string;
  name: string;
  type: "primary" | "secondary" | "guardrail";
  definition: string;
  target?: string;
}

// ─── Decision Output ───────────────────────────────────────────────────────

/** Full decision output: problem → causes → segments → hypotheses → experiments → metrics */
export interface DecisionOutput {
  problem: ProductProblem;
  structuredProblem: StructuredProblem;
  segments: UserSegment[];
  hypotheses: Hypothesis[];
  experiments: Experiment[];
  metrics: Metric[];
}
