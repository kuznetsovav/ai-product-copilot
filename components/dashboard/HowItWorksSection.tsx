"use client";

const STEPS = [
  {
    number: 1,
    title: "Describe the product problem",
    body:
      "You provide a concise description and any relevant context about where users are getting stuck or outcomes are off.",
  },
  {
    number: 2,
    title: "AI structures the issue",
    body:
      "The copilot turns your description into a structured problem: funnel stage, friction points, and intent mismatch.",
  },
  {
    number: 3,
    title: "Experiments are evaluated & ranked",
    body:
      "Candidate experiments are scored on impact, effort, risk, and confidence using RICE / ICE-style models and sensitivity checks.",
  },
  {
    number: 4,
    title: "Get recommended focus",
    body:
      "You see a clear recommended experiment plus a ranked backlog with transparent reasoning you can share with stakeholders.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
        How it works
      </h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs text-zinc-300">
        {STEPS.map((step) => (
          <li
            key={step.number}
            className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 sm:p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15 text-[11px] font-semibold text-amber-400">
                {step.number}
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
                {step.title}
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

