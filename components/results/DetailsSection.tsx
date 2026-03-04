"use client";

import type { DashboardData } from "@/ui/dashboard/analyze-form";

interface DetailsSectionProps {
  data: DashboardData;
}

export function DetailsSection({ data }: DetailsSectionProps) {
  const { behavioralSegments, lifecycleSegments, intentBasedSegments } =
    data.segments;
  const causes = data.hypotheses.likelyCauses;
  const solutions = data.hypotheses.potentialSolutions;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-300">
          Details
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Structured breakdown of segments, root causes, and hypotheses.
        </p>
      </div>

      <div className="divide-y divide-zinc-800">
        {/* User Segments */}
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-900/80">
            <span>User segments</span>
            <span className="text-xs text-zinc-500 group-open:hidden">Show</span>
            <span className="hidden text-xs text-zinc-500 group-open:inline">
              Hide
            </span>
          </summary>
          <div className="space-y-3 px-4 pb-4 text-xs text-zinc-200">
            {behavioralSegments.length > 0 && (
              <div>
                <p className="mb-1 font-medium text-zinc-300">Behavioral</p>
                <ul className="list-disc space-y-1 pl-4">
                  {behavioralSegments.map((s) => (
                    <li key={s.id}>
                      <span className="font-medium">{s.name}</span>{" "}
                      <span className="text-zinc-400">— {s.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {lifecycleSegments.length > 0 && (
              <div>
                <p className="mb-1 font-medium text-zinc-300">Lifecycle</p>
                <ul className="list-disc space-y-1 pl-4">
                  {lifecycleSegments.map((s) => (
                    <li key={s.id}>
                      <span className="font-medium">{s.name}</span>{" "}
                      <span className="text-zinc-400">— {s.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {intentBasedSegments.length > 0 && (
              <div>
                <p className="mb-1 font-medium text-zinc-300">Intent-based</p>
                <ul className="list-disc space-y-1 pl-4">
                  {intentBasedSegments.map((s) => (
                    <li key={s.id}>
                      <span className="font-medium">{s.name}</span>{" "}
                      <span className="text-zinc-400">— {s.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {behavioralSegments.length === 0 &&
              lifecycleSegments.length === 0 &&
              intentBasedSegments.length === 0 && (
                <p className="text-zinc-500">No segments identified.</p>
              )}
          </div>
        </details>

        {/* Root Causes */}
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-900/80">
            <span>Root causes</span>
            <span className="text-xs text-zinc-500 group-open:hidden">Show</span>
            <span className="hidden text-xs text-zinc-500 group-open:inline">
              Hide
            </span>
          </summary>
          <div className="px-4 pb-4 text-xs text-zinc-200">
            {causes.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4">
                {causes.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium">{c.description}</span>{" "}
                    <span className="text-zinc-500">
                      (Likelihood: {c.likelihood})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500">No root causes identified.</p>
            )}
          </div>
        </details>

        {/* Hypotheses */}
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm text-zinc-200 hover:bg-zinc-900/80">
            <span>Hypotheses</span>
            <span className="text-xs text-zinc-500 group-open:hidden">Show</span>
            <span className="hidden text-xs text-zinc-500 group-open:inline">
              Hide
            </span>
          </summary>
          <div className="px-4 pb-4 text-xs text-zinc-200">
            {solutions.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4">
                {solutions.map((s) => (
                  <li key={s.id}>
                    <span className="font-medium">{s.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500">No hypotheses generated.</p>
            )}
          </div>
        </details>
      </div>
    </section>
  );
}


