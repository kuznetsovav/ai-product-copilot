import type { DashboardData } from "@/ui/dashboard/analyze-form";
import type { PrioritizedExperiment } from "@/lib/types/prioritization";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { SensitivityRange } from "@/components/ui/SensitivityRange";

interface PrioritizedExperimentsSectionProps {
  prioritizedExperiments: PrioritizedExperiment[] | null;
  data: DashboardData;
  scoringModelName: "rice" | "ice";
  onScoringModelChange: (name: "rice" | "ice") => void;
  warning?: string;
}

export function PrioritizedExperimentsSection({
  prioritizedExperiments,
  data,
  scoringModelName,
  onScoringModelChange,
  warning,
}: PrioritizedExperimentsSectionProps) {
  if (!prioritizedExperiments || prioritizedExperiments.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            Prioritized experiments
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Ranked by selected scoring model using impact, effort, risk, and confidence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="scoring-model"
            className="text-xs font-medium text-zinc-400"
          >
            Scoring model
          </label>
          <select
            id="scoring-model"
            value={scoringModelName}
            onChange={(e) =>
              onScoringModelChange(e.target.value === "ice" ? "ice" : "rice")
            }
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          >
            <option value="rice">RICE (risk-adjusted)</option>
            <option value="ice">ICE</option>
          </select>
        </div>
      </div>

      {warning && (
        <p className="mb-3 text-xs text-amber-400">Prioritization warning: {warning}</p>
      )}

      <ul className="space-y-3">
        {prioritizedExperiments.map((exp, index) => {
          const meta =
            data.experiments.experiments.find(
              (e) => e.id === exp.experimentId
            ) ?? null;

          const globalRank = index + 1;

          const causesById = new Map(
            data.hypotheses.likelyCauses.map((c) => [c.id, c])
          );
          const allSegments = [
            ...data.segments.behavioralSegments,
            ...data.segments.lifecycleSegments,
            ...data.segments.intentBasedSegments,
          ];
          const segmentsById = new Map(allSegments.map((s) => [s.id, s]));

          const causeIds = meta?.causeIds ?? [];
          const causes = causeIds
            .map((id) => causesById.get(id))
            .filter((c): c is NonNullable<typeof c> => !!c);

          const segments = Array.from(
            new Map(
              causes
                .flatMap((c) => c.segmentIds ?? [])
                .map((id) => [id, segmentsById.get(id)])
                .filter(([, seg]) => !!seg) as Array<
                [string, (typeof allSegments)[0]]
              >
            ).values()
          );

          const solution = meta?.solutionId
            ? data.hypotheses.potentialSolutions.find(
                (s) => s.id === meta.solutionId
              )
            : undefined;

          return (
            <li
              key={exp.experimentId}
              className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3 sm:p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-semibold text-amber-400">
                    {globalRank}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {meta?.name ?? `Experiment ${exp.experimentId}`}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                      Composite score:{" "}
                      <span className="text-amber-400">
                        {exp.compositeScore.toFixed(2)}
                      </span>
                    </p>
                    {meta?.design && (
                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        {meta.design.length > 120
                          ? `${meta.design.slice(0, 120)}…`
                          : meta.design}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-zinc-200">
                <ScoreBadge label="Impact" value={exp.impactScore} />
                <ScoreBadge label="Effort" value={exp.effortScore} />
                <ScoreBadge label="Risk" value={exp.riskScore} />
                <ScoreBadge label="Confidence" value={exp.confidenceScore} />
              </div>

              {exp.sensitivityRange && (
                <div className="mb-2">
                  <SensitivityRange
                    minScore={exp.sensitivityRange.minScore}
                    maxScore={exp.sensitivityRange.maxScore}
                  />
                </div>
              )}

              <div className="mb-2 space-y-1 text-[11px] text-zinc-200">
                {segments.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-zinc-500">Segments:</span>
                    {segments.slice(0, 4).map((s) => (
                      <span
                        key={s.id}
                        className="rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-200 border border-zinc-700/60"
                      >
                        {s.name}
                      </span>
                    ))}
                    {segments.length > 4 && (
                      <span className="text-[10px] text-zinc-500">
                        +{segments.length - 4} more
                      </span>
                    )}
                  </div>
                )}
                {causes.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-zinc-500">Root causes:</span>
                    {causes.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        className="rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-200 border border-zinc-700/60"
                        title={c.description}
                      >
                        {c.description.length > 32
                          ? `${c.description.slice(0, 32)}…`
                          : c.description}
                      </span>
                    ))}
                    {causes.length > 3 && (
                      <span className="text-[10px] text-zinc-500">
                        +{causes.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                {solution && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-zinc-500">Hypothesis:</span>
                    <span className="rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-200 border border-zinc-700/60">
                      {solution.description}
                    </span>
                  </div>
                )}
              </div>

              {exp.reasoning && (
                <details className="mt-1 text-xs text-zinc-300">
                  <summary className="cursor-pointer text-zinc-400 hover:text-zinc-200">
                    Detailed reasoning
                  </summary>
                  <div className="mt-2 whitespace-pre-line border-t border-zinc-800 pt-2">
                    {exp.reasoning}
                  </div>
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

