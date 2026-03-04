import type { DashboardData } from "@/ui/dashboard/analyze-form";

interface ProblemSummarySectionProps {
  data: DashboardData;
}

export function ProblemSummarySection({ data }: ProblemSummarySectionProps) {
  if (!data) return null;

  const { problem, structuredProblem } = data;
  const mainFriction =
    structuredProblem.likelyFrictionPoints[0] ?? "No specific friction point identified";

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
      <header className="mb-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Problem summary
        </h2>
        <p className="mt-1 text-sm text-zinc-100">
          {problem.description}
        </p>
        {problem.context && (
          <p className="mt-1 text-xs text-zinc-500">
            Context: {problem.context}
          </p>
        )}
      </header>

      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-800 px-2 py-1 text-[11px] uppercase tracking-wide text-zinc-400">
            Funnel stage
          </span>
          <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[11px] font-medium text-amber-300">
            {structuredProblem.funnelStage || "unknown"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-800 px-2 py-1 text-[11px] uppercase tracking-wide text-zinc-400">
            Main friction
          </span>
          <span className="max-w-xs truncate text-[11px] text-zinc-200">
            {mainFriction}
          </span>
        </div>
      </div>
    </section>
  );
}

