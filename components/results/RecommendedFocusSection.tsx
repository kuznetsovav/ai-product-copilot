import type { DashboardData } from "@/ui/dashboard/analyze-form";
import type { PrioritizedExperiment } from "@/lib/types/prioritization";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { SensitivityRange } from "@/components/ui/SensitivityRange";

interface RecommendedFocusSectionProps {
  recommendedExperiment: PrioritizedExperiment | null;
  data: DashboardData;
}

export function RecommendedFocusSection({
  recommendedExperiment,
  data,
}: RecommendedFocusSectionProps) {
  if (!recommendedExperiment) return null;

  const top = recommendedExperiment;
  const experimentMeta =
    data.experiments.experiments.find((exp) => exp.id === top.experimentId) ??
    null;

  const causesById = new Map(
    data.hypotheses.likelyCauses.map((c) => [c.id, c])
  );
  const allSegments = [
    ...data.segments.behavioralSegments,
    ...data.segments.lifecycleSegments,
    ...data.segments.intentBasedSegments,
  ];
  const segmentsById = new Map(allSegments.map((s) => [s.id, s]));

  const causeIds = experimentMeta?.causeIds ?? [];
  const causes = causeIds
    .map((id) => causesById.get(id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  const segments = Array.from(
    new Map(
      causes
        .flatMap((c) => c.segmentIds ?? [])
        .map((id) => [id, segmentsById.get(id)])
        .filter(([, seg]) => !!seg) as Array<[string, (typeof allSegments)[0]]>
    ).values()
  );

  const solution = experimentMeta?.solutionId
    ? data.hypotheses.potentialSolutions.find(
        (s) => s.id === experimentMeta.solutionId
      )
    : undefined;

  const executiveSummary =
    experimentMeta?.design ??
    top.reasoning.split("\n")[0] ??
    "High-impact experiment recommended based on current analysis.";

  return (
    <section className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/40 via-zinc-950/60 to-zinc-950/80 p-4 shadow-lg shadow-black/40 sm:p-5">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
            Recommended focus
          </h2>
          <p className="mt-1 text-sm font-medium text-zinc-100">
            {experimentMeta?.name ?? `Experiment ${top.experimentId}`}
          </p>
          <p className="mt-1 text-xs text-zinc-300">
            {executiveSummary}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] uppercase tracking-wide text-amber-300/80">
            Composite score
          </p>
          <p className="text-2xl font-semibold text-amber-400">
            {top.compositeScore.toFixed(2)}
          </p>
        </div>
      </header>

      <div className="mb-3 flex flex-wrap gap-2 text-[11px] text-zinc-200">
        <ScoreBadge label="Impact" value={top.impactScore} />
        <ScoreBadge label="Effort" value={top.effortScore} />
        <ScoreBadge label="Risk" value={top.riskScore} />
        <ScoreBadge label="Confidence" value={top.confidenceScore} />
      </div>

      {top.sensitivityRange && (
        <div className="mb-3">
          <SensitivityRange
            minScore={top.sensitivityRange.minScore}
            maxScore={top.sensitivityRange.maxScore}
          />
        </div>
      )}

      <div className="mb-3 space-y-2 text-[11px] text-zinc-200">
        {segments.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-500">Segments:</span>
            {segments.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-200 border border-zinc-700/60"
              >
                {s.name}
              </span>
            ))}
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
                {c.description.length > 40
                  ? `${c.description.slice(0, 40)}…`
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

      {top.reasoning && (
        <details className="mt-2 text-xs text-zinc-300">
          <summary className="cursor-pointer text-zinc-400 hover:text-zinc-200">
            Why this is recommended
          </summary>
          <div className="mt-2 whitespace-pre-line border-t border-zinc-800 pt-2">
            {top.reasoning}
          </div>
        </details>
      )}
    </section>
  );
}


