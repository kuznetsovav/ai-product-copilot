"use client";

import type { DashboardData } from "./analyze-form";

function segmentIdToNameMap(data: DashboardData): Map<string, string> {
  const map = new Map<string, string>();
  const { behavioralSegments, lifecycleSegments, intentBasedSegments } = data.segments;
  [...behavioralSegments, ...lifecycleSegments, ...intentBasedSegments].forEach((s) =>
    map.set(s.id, s.name)
  );
  return map;
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5 ${className}`}
    >
      <h3 className="mb-3 text-xs sm:text-sm font-medium uppercase tracking-wider text-amber-500/90">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ProblemSummaryCard({ data }: { data: DashboardData }) {
  const { problem, structuredProblem } = data;
  return (
    <Card title="Problem summary">
      <p className="mb-3 text-sm text-zinc-300 break-words">{problem.description}</p>
      {problem.context && (
        <p className="mb-3 text-xs text-zinc-500">Context: {problem.context}</p>
      )}
      <div className="space-y-2 text-sm">
        <p>
          <span className="text-zinc-500">Funnel stage:</span>{" "}
          <span className="text-zinc-200">{structuredProblem.funnelStage}</span>
        </p>
        {structuredProblem.likelyFrictionPoints.length > 0 && (
          <div>
            <span className="text-zinc-500">Friction points:</span>
            <ul className="mt-1 list-inside list-disc text-zinc-300">
              {structuredProblem.likelyFrictionPoints.map((fp, i) => (
                <li key={i}>{fp}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-2 mt-2">
          <p className="text-xs text-zinc-500">Intent mismatch</p>
          <p className="text-sm text-zinc-200">
            Expectation: {structuredProblem.intentMismatch.userExpectation}
          </p>
          <p className="text-sm text-zinc-200">
            Reality: {structuredProblem.intentMismatch.productReality}
          </p>
          <p className="text-sm text-amber-400/80">
            Gap: {structuredProblem.intentMismatch.gap}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function CausesCard({ data }: { data: DashboardData }) {
  const causes = data.hypotheses.likelyCauses;
  if (causes.length === 0) return null;
  const segmentMap = segmentIdToNameMap(data);
  return (
    <Card title="Causes">
      <ul className="space-y-2">
        {causes.map((c, i) => {
          const segmentNames = (c.segmentIds ?? [])
            .map((id) => segmentMap.get(id))
            .filter((n): n is string => !!n);
          return (
            <li
              key={c.id}
              className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3"
            >
              <div className="mb-1 flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500/30 text-xs font-semibold text-amber-400">
                  {i + 1}
                </span>
                <p className="text-sm text-zinc-200 break-words">{c.description}</p>
              </div>
              <p className="mt-1 text-xs text-zinc-500">Likelihood: {c.likelihood}</p>
              {segmentNames.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-zinc-700/50 pt-2">
                  <span className="mr-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-amber-500/70">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth={2} strokeLinecap="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    Segments
                  </span>
                  {segmentNames.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center rounded border border-dashed border-amber-500/40 bg-amber-950/30 px-1.5 py-0.5 text-[11px] text-amber-400/90"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function SegmentsCard({ data }: { data: DashboardData }) {
  const { behavioralSegments, lifecycleSegments, intentBasedSegments } =
    data.segments;
  const hasAny =
    behavioralSegments.length > 0 ||
    lifecycleSegments.length > 0 ||
    intentBasedSegments.length > 0;
  if (!hasAny) return null;

  function SegmentList({
    items,
    label,
  }: {
    items: Array<{ id: string; name: string; description: string; criteria: string[] }>;
    label: string;
  }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-3 last:mb-0">
        <p className="mb-1 text-xs font-medium text-zinc-500">{label}</p>
        <ul className="space-y-1.5">
          {items.map((s) => (
            <li
              key={s.id}
              className="rounded border border-zinc-700 bg-zinc-800/20 px-2 py-1.5"
            >
              <span className="text-sm font-medium text-zinc-200 break-words">{s.name}</span>
              <p className="text-xs text-zinc-400">{s.description}</p>
              {s.criteria.length > 0 && (
                <p className="mt-0.5 text-xs text-zinc-500">
                  {s.criteria.join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <Card title="Segments">
      <SegmentList items={behavioralSegments} label="Behavioral" />
      <SegmentList items={lifecycleSegments} label="Lifecycle" />
      <SegmentList items={intentBasedSegments} label="Intent-based" />
    </Card>
  );
}

export function HypothesesCard({ data }: { data: DashboardData }) {
  const { likelyCauses, potentialSolutions } = data.hypotheses;
  const hasAny = likelyCauses.length > 0 || potentialSolutions.length > 0;
  if (!hasAny) return null;
  const causeIdToNumber = new Map(likelyCauses.map((c, i) => [c.id, i + 1]));
  return (
    <Card title="Hypotheses">
      {potentialSolutions.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium text-zinc-500">
            Potential solutions
          </p>
          <ul className="space-y-1.5">
            {potentialSolutions.map((s) => {
              const causeNumbers = (s.addressesCauseIds ?? [])
                .map((id) => causeIdToNumber.get(id))
                .filter((n): n is number => n != null)
                .sort((a, b) => a - b);
              return (
                <li
                  key={s.id}
                  className="rounded-lg border border-emerald-800/40 bg-emerald-900/20 p-2"
                >
                  <p className="text-sm text-zinc-200 break-words">{s.description}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">Effort: {s.effort ?? "—"}</p>
                  {causeNumbers.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-emerald-800/30 pt-2">
                      <span className="mr-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-emerald-500/80">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeWidth={2} strokeLinecap="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Addresses
                      </span>
                      {causeNumbers.map((n) => (
                        <span
                          key={n}
                          className="inline-flex items-center justify-center rounded border border-dashed border-emerald-500/50 bg-emerald-950/30 px-1.5 py-0.5 text-[11px] font-medium text-emerald-300/90"
                        >
                          C{n}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}

export function ExperimentsCard({ data }: { data: DashboardData }) {
  const experiments = data.experiments.experiments;
  if (experiments.length === 0) return null;
  const impacts = data.experiments.expectedImpact;
  const impactMap = new Map(impacts.map((i) => [i.experimentId, i]));
  return (
    <Card title="Experiments">
      <ul className="space-y-3">
        {experiments.map((e, i) => {
          const impact = impactMap.get(e.id);
          return (
            <li
              key={e.id}
              className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3"
            >
              <div className="mb-1 flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-500/30 text-xs font-semibold text-amber-400">
                  {i + 1}
                </span>
                <p className="font-medium text-zinc-200">{e.name}</p>
              </div>
              <p className="mt-1 text-sm text-zinc-400 break-words">{e.design}</p>
              <div className="mt-2 flex flex-wrap gap-1 text-xs text-zinc-500">
                {e.duration && <span>Duration: {e.duration}</span>}
                {e.solutionId && <span>· Solution: {e.solutionId}</span>}
              </div>
              {impact && (
                <div className="mt-2 rounded border border-amber-800/30 bg-amber-900/10 px-2 py-1 text-xs text-amber-200/80">
                  {impact.description}
                  {impact.magnitude && ` (${impact.magnitude})`}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function MetricsCard({ data }: { data: DashboardData }) {
  const metrics = data.experiments.successMetrics;
  const experiments = data.experiments.experiments;
  if (metrics.length === 0) return null;
  const experimentIdToNumber = new Map(experiments.map((e, i) => [e.id, i + 1]));
  return (
    <Card title="Metrics">
      <ul className="space-y-2">
        {metrics.map((m) => {
          const expNumber = experimentIdToNumber.get(m.experimentId);
          return (
            <li
              key={m.id}
              className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-200">{m.name}</span>
                <div className="flex items-center gap-1.5">
                  {expNumber != null && (
                    <span className="inline-flex items-center justify-center rounded border border-dashed border-amber-500/40 bg-amber-950/30 px-1.5 py-0.5 text-[10px] font-medium text-amber-400/90">
                      E{expNumber}
                    </span>
                  )}
                  <span className="rounded px-1.5 py-0.5 text-xs text-zinc-500 bg-zinc-700/50">
                    {m.type}
                  </span>
                </div>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400 break-words">{m.definition}</p>
              {m.target && (
                <p className="mt-1 text-xs text-amber-400/80">Target: {m.target}</p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
