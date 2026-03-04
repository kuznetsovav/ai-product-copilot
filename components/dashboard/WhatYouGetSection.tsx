"use client";

export function WhatYouGetSection() {
  const items = [
    {
      title: "Problem structuring",
      body:
        "Your raw description is converted into funnel stage, key friction points, and an explicit intent mismatch between user expectation and product reality.",
    },
    {
      title: "Prioritized experiments",
      body:
        "You get a ranked list of experiments with clear scores, recommended next action, and links back to hypotheses and segments.",
    },
    {
      title: "Risk & confidence scoring",
      body:
        "Impact, effort, risk, and confidence are estimated with dedicated models, so you can see where uncertainty lives instead of a single opaque score.",
    },
    {
      title: "Sensitivity simulation",
      body:
        "Each experiment includes a sensitivity range, showing how rankings might shift with ±20% changes in impact and effort assumptions.",
    },
  ];

  return (
    <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-400">
        What you get
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="h-full rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 sm:p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-300">
              {item.title}
            </p>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

