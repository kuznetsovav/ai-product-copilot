# PM Decision Copilot — Product Case Study

AI-powered decision-support system that helps Product Managers move from vague product problems to structured, actionable decisions.

---

## Problem

Product Managers regularly face ill-defined problems: "Users are dropping off somewhere," "We don't know why conversion is low," "Onboarding feels broken." These fuzzy statements resist clear framing and lead to:

- **Unstructured exploration** — Ad-hoc Slack threads, fragmented docs, misaligned mental models
- **Slow decisions** — Repeated cycles of "we need more data" without a clear path to action
- **Weak hypotheses** — Generic solutions instead of segment-specific, testable hypotheses
- **Missed intent gaps** — User expectation vs. product reality often overlooked until late

The core issue: there is no lightweight system that turns a messy problem description into a structured reasoning chain (causes → segments → hypotheses → experiments) without heavy process or long meetings.

---

## Users

**Primary: Product Managers**

- Need to go from "something is wrong" to a clear decision framework
- Want speed without sacrificing rigor
- Prefer structured output over chat for sharing with stakeholders
- Often work alone or in small pods; no dedicated analytics team

**Secondary: Growth / UX / Data PMs**

- Use the system to align on problem framing before diving into dashboards or experiments

---

## Solution

**PM Decision Copilot** is a structured reasoning pipeline — not a chatbot. A PM enters a problem description; the system produces:

| Layer | Output |
|-------|--------|
| **Problem** | Raw issue as stated |
| **Structuring** | Funnel stage, friction points, intent mismatch |
| **Segmentation** | Behavioral, lifecycle, intent-based segments |
| **Hypothesis** | Likely causes and potential solutions |
| **Experiments** | Test design, success metrics, expected impact |
| **Decision** | Structured output suitable for stakeholder review |

**Key flows**

- **Intake** — PM describes the issue in `/intake`
- **Dashboard** — Reasoning layers + detailed cards (causes, segments, hypotheses, experiments, metrics)
- **Past decisions** — Local persistence for browsing and reusing earlier analyses

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Problem Input                              │
└─────────────────────────────┬───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Pipeline Orchestrator                                            │
│  Problem → Structuring → Segmentation → Hypothesis → Experiment   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Problem         │  │ Segmentation    │  │ Experiment      │
│ Structuring     │  │ Agent           │  │ Agent           │
│ Agent           │  │                 │  │                 │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AI Service (OpenAI) — Structured outputs only, JSON schema      │
└─────────────────────────────────────────────────────────────────┘
```

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind, Server Actions, API Routes, OpenAI (GPT-4o-mini)

**Folders:**
- `/app` — Pages (intake, dashboard), API routes
- `/ui` — Components (cards, decision layers, past decisions)
- `/lib` — Agents, orchestrator, AI service, types, store

---

## Tradeoffs

| Tradeoff | Choice | Rationale |
|----------|--------|-----------|
| **Chat vs. structured** | Structured pipeline | PMs need shareable artifacts and fast scanning; chat is exploratory, not decisive |
| **General vs. specific agents** | 4 specialized agents | Problem structuring, segmentation, hypothesis, and experiment design need different prompts and schemas |
| **localStorage vs. server DB** | localStorage | Simpler deployment, no auth; works across devices via URL sharing patterns later |
| **GPT-4o vs. GPT-4o-mini** | GPT-4o-mini | Cost/speed; structured outputs keep quality high enough for internal use |

---

## Metrics

| Metric | Target | How to measure |
|--------|--------|----------------|
| **Time to first hypothesis** | &lt; 2 min | Time from problem entry to structured output |
| **Completeness** | 100% | All pipeline layers populated; no empty arrays where schema expects data |
| **Reusability** | Past decisions used | Clicks on past decisions vs. new analyses |
| **Schema compliance** | 100% | Structured outputs pass Zod validation; no free-form text fallback |

---

## Setup

1. **Node.js 18+**

2. Add your OpenAI API key:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and set OPENAI_API_KEY=sk-your-actual-key
   npm run check-env   # verify it's set
   ```

3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

**Troubleshooting:** If you see "OPENAI_API_KEY is not set", ensure `.env.local` exists with `OPENAI_API_KEY=sk-...` (no quotes, no spaces around `=`), run `npm run check-env`, then restart the dev server.

## API

**POST /api/analyze-problem**

```json
{
  "description": "Users drop off at step 2 of signup. 70% never complete.",
  "context": "B2B SaaS, 14-day trial"
}
```

Returns full decision output: problem, structuredProblem, segments, hypotheses, experiments.
