# AI Product Copilot

AI Product Copilot is a structured decision-support system that helps Product Managers transform vague product problems into structured insights and prioritized action plans.

Unlike a chatbot, the copilot runs a multi-stage reasoning and prioritization pipeline to produce artifacts that look and feel like the outputs of a real product team.

This project explores how AI can support product decision-making using structured reasoning and prioritization models similar to those used by experienced PMs.

---

## Product Description

AI Product Copilot is designed for Product Managers who need to move from:

- “Something is wrong with activation”
- “Conversion is low but we don’t know why”
- “Onboarding feels broken”

to a **clear, structured decision** about what to do next.

You provide a problem description (and optional context such as product stage, team size, or risk tolerance). The system:

1. Structures the problem into a consistent representation.
2. Generates hypotheses, experiments, and metrics.
3. Prioritizes experiments using explicit scoring models.
4. Surfaces a recommended next experiment and a ranked backlog.

The output is intentionally non-chatty: you get structured JSON and a dashboard-style UI, not a conversational transcript.

---

## What the Copilot Provides

Given a single product problem input, the copilot produces a set of layered, structured outputs:

- **Problem structuring**  
  - Funnel stage (e.g. awareness, activation, retention)  
  - Key friction points  
  - Intent mismatch between user expectation and product reality

- **User segmentation**  
  - Behavioral segments  
  - Lifecycle segments  
  - Intent-based segments

- **Root cause hypotheses**  
  - Likely causes of the problem  
  - Links from causes to affected segments

- **Experiment ideas**  
  - Concrete experiments to validate solutions  
  - Each with a design, optional duration, and linked causes/solutions

- **Prioritized experiments**  
  - Per-experiment scores for impact, effort, risk, and confidence  
  - Composite prioritization score per experiment

- **Sensitivity analysis**  
  - Sensitivity range per experiment, showing how rankings change under ±20% shifts in impact and effort

- **Recommended focus experiment**  
  - A single highlighted experiment chosen based on composite score  
  - Includes short executive summary, dimensional scores, and attached segments/causes/hypotheses

Experiments are always ranked based on four dimensions:

- **Impact** — how much the experiment could move the chosen metric
- **Effort** — expected implementation and coordination cost
- **Risk** — technical, adoption, and business risk
- **Confidence** — strength of evidence and similarity to past patterns

---

## Decision Engine

At the core of AI Product Copilot is a decision engine that turns estimates into rankings.

Each experiment receives four scalar scores:

- **Impact** — 1–10, based on how directly and strongly the experiment influences the north star metric.
- **Effort** — 1–10, reflecting implementation scope, dependencies, and required capacity.
- **Risk** — 1–10, combining technical, adoption, and business risk, adjusted for reversibility.
- **Confidence** — 1–10, capturing evidence strength, data quality, and similarity to known patterns.

On top of these dimensions, the engine can apply different **scoring models**, such as:

- **RICE-style** (risk-adjusted):  
  `(Impact × Confidence / Effort) × RiskAdjustment`

- **ICE-style** (without explicit risk):  
  `Impact × Confidence / Effort`

Scoring models are implemented as pluggable `ScoringModel` interfaces, so different weighting strategies can be explored without changing the upstream pipeline.

The engine:

1. Normalizes and applies the selected scoring model.
2. Computes a composite score for each experiment.
3. Runs a sensitivity simulation (±20% impact/effort) to derive a score range.
4. Ranks experiments from highest to lowest composite score.
5. Highlights a **Recommended Focus** experiment based on the current model.

This keeps prioritization explicit and inspectable rather than hidden behind an opaque “AI suggestion.”

---

## System Architecture

The copilot is built as a multi-stage reasoning pipeline. Each stage consumes typed inputs and produces structured outputs.

High-level flow:

1. **Problem Input**  
   - Raw problem description and optional context (north star metric, product stage, team size, risk tolerance).

2. **Problem Structuring Agent**  
   - Transforms the input into a structured problem: funnel stage, friction points, intent mismatch.

3. **Segmentation Agent**  
   - Generates behavioral, lifecycle, and intent-based segments relevant to the problem.

4. **Hypothesis Agent**  
   - Produces likely root causes and potential solutions.  
   - Links causes to segments and solutions to causes.

5. **Experiment Generator**  
   - Designs experiments from the hypotheses.  
   - For each experiment, produces:
     - `id`, `name`, `design`, optional `solutionId`, optional `causeIds`, optional `duration`  
     - Success metrics (primary, secondary, guardrail)  
     - Expected impact (description, magnitude, confidence)

6. **Prioritization Engine**  
   - For each experiment:
     - Runs dedicated estimators for impact, effort, risk, and confidence (using OpenAI structured output).  
     - Applies a selected scoring model (e.g. RICE or ICE).  
     - Computes sensitivity ranges and a composite score.
   - Produces:
     - `PrioritizedExperiment[]` with dimensional scores, composite scores, sensitivity ranges, and reasoning.
     - A single recommended experiment based on composite score.

7. **Decision Output**  
   - Aggregated structure combining:
     - Problem input and structuring  
     - Segments and hypotheses  
     - Experiments and metrics  
     - Prioritized experiments and recommended focus

Every stage emits **structured JSON** validated with Zod. No stage returns free-form chat text; the UI is a dashboard over these structured artifacts.

---

## Tech Stack

- **Next.js** (App Router) — Web application and API routes
- **TypeScript** — Strongly typed domain models and interfaces
- **OpenAI API** — Structured-output agents for problem structuring, segmentation, hypotheses, experiments, and estimators
- **Multi-agent reasoning pipeline** — Problem → Structuring → Segmentation → Hypothesis → Experiment
- **Prioritization engine** — Estimators, scoring models (RICE/ICE), sensitivity analysis, and recommendation selection
- **Tailwind CSS** — Clean, minimal UI for the dashboard and results

---

## Product Vision

AI Product Copilot is not intended to replace product thinking. It is a tool to **augment** structured decision-making for Product Managers.

The goals of the project are to:

- Explore how AI can help PMs move faster from fuzzy problems to structured decision frameworks.
- Preserve rigor by making every step of the reasoning and prioritization pipeline explicit and inspectable.
- Provide outputs that are easy to share in product reviews, leadership updates, or interviews.

Instead of a conversational assistant, AI Product Copilot acts as a **decision engine**: it ingests a problem, runs a transparent multi-stage process, and produces a prioritized, explainable plan of action.

