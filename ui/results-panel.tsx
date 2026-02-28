"use client";

import { useDecisionResult } from "@/ui/decision-context";

export function ResultsPanel() {
  const { result } = useDecisionResult();

  if (!result || !result.success) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-8 text-center">
        <p className="text-sm text-zinc-500">
          {result?.error ?? "Submit a problem to see the structured decision framework"}
        </p>
      </div>
    );
  }

  const { structuredProblem, decisionFramework } = result;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="mb-4 text-lg font-medium text-zinc-200">Decision framework</h2>
      <div className="space-y-6">
        {structuredProblem && (
          <section>
            <h3 className="mb-2 text-sm font-medium text-amber-500/90">
              Structured problem
            </h3>
            <div className="space-y-1.5 text-sm text-zinc-300">
              <p>
                <span className="text-zinc-500">Core question:</span>{" "}
                {structuredProblem.coreQuestion}
              </p>
              {structuredProblem.keyStakeholders.length > 0 && (
                <p>
                  <span className="text-zinc-500">Stakeholders:</span>{" "}
                  {structuredProblem.keyStakeholders.join(", ")}
                </p>
              )}
              {structuredProblem.successCriteria.length > 0 && (
                <p>
                  <span className="text-zinc-500">Success criteria:</span>{" "}
                  {structuredProblem.successCriteria.join("; ")}
                </p>
              )}
            </div>
          </section>
        )}
        {decisionFramework && (
          <>
            <section>
              <h3 className="mb-2 text-sm font-medium text-amber-500/90">
                Decision statement
              </h3>
              <p className="text-sm text-zinc-300">
                {decisionFramework.decisionStatement}
              </p>
            </section>
            <section>
              <h3 className="mb-2 text-sm font-medium text-amber-500/90">
                Options
              </h3>
              <div className="space-y-3">
                {decisionFramework.options.map((opt) => (
                  <div
                    key={opt.id}
                    className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium text-zinc-200">
                        {opt.title}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Effort: {opt.effort}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{opt.description}</p>
                    <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                      {opt.pros.slice(0, 2).map((p, i) => (
                        <li
                          key={i}
                          className="rounded bg-emerald-900/40 px-1.5 text-emerald-300"
                        >
                          + {p}
                        </li>
                      ))}
                      {opt.cons.slice(0, 2).map((c, i) => (
                        <li
                          key={i}
                          className="rounded bg-red-900/30 px-1.5 text-red-300"
                        >
                          − {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-2 text-sm font-medium text-amber-500/90">
                Recommendation
              </h3>
              <div className="rounded-lg border border-amber-800/50 bg-amber-900/20 p-3">
                <p className="text-sm text-zinc-200">
                  {decisionFramework.recommendation.reasoning}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Confidence:{" "}
                  {(decisionFramework.recommendation.confidence * 100).toFixed(
                    0
                  )}
                  %
                </p>
              </div>
            </section>
            {decisionFramework.nextSteps.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-medium text-amber-500/90">
                  Next steps
                </h3>
                <ul className="list-inside list-decimal space-y-1 text-sm text-zinc-400">
                  {decisionFramework.nextSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
