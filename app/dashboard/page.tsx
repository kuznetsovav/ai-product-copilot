"use client";

import { useState, useEffect, useRef } from "react";
import { AnalyzeForm, type DashboardData } from "@/ui/dashboard/analyze-form";
import { INTAKE_RESULT_KEY } from "@/lib/constants";
import { getDecisions } from "@/lib/store/decisions";
import {
  ProblemSummaryCard,
  CausesCard,
  SegmentsCard,
  HypothesesCard,
  ExperimentsCard,
  MetricsCard,
} from "@/ui/dashboard/cards";
import { FlowArrow } from "@/ui/dashboard/card-connectors";
import { PastDecisions } from "@/ui/dashboard/past-decisions";

const PROGRESS_CAP = 99;
const PROGRESS_DURATION_MS = 28000; // time to reach 99% if job is slow

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const hasHistory = getDecisions().length > 0;
  const [progress, setProgress] = useState(0);
  const progressStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const lastLabelUpdateRef = useRef(0);

  useEffect(() => {
    if (!loading) return;
    setProgress(0);
    progressStartRef.current = performance.now();
    lastLabelUpdateRef.current = 0;
    if (barRef.current) barRef.current.style.width = "0%";

    function tick(now: number) {
      const start = progressStartRef.current ?? now;
      const elapsed = now - start;
      const p = Math.min((elapsed / PROGRESS_DURATION_MS) * PROGRESS_CAP, PROGRESS_CAP);
      if (barRef.current) barRef.current.style.width = `${p}%`;
      if (now - lastLabelUpdateRef.current >= 80) {
        lastLabelUpdateRef.current = now;
        setProgress(p);
      }
      if (p < PROGRESS_CAP) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      progressStartRef.current = null;
    };
  }, [loading]);

  const prevLoadingRef = useRef(false);
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = loading;
    if (wasLoading && !loading) {
      setProgress(100);
      const t = setTimeout(() => setProgress(0), 600);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    const stored = sessionStorage.getItem(INTAKE_RESULT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.success && parsed.problem) {
          setData(parsed);
          sessionStorage.removeItem(INTAKE_RESULT_KEY);
        }
      } catch {
        sessionStorage.removeItem(INTAKE_RESULT_KEY);
      }
    }
  }, []);

  return (
    <main className="min-h-screen w-full bg-[var(--background)]">
      <div className="flex w-full justify-center">
        <div className="w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <header className="mb-6 sm:mb-8 text-center">
            <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl">
              PM Decision Copilot
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm max-w-2xl mx-auto">
              Structured reasoning: problem → causes → segments → hypotheses → experiments → metrics
            </p>
          </header>

          <div
            className={`mb-6 sm:mb-8 flex flex-col gap-4 ${
              hasHistory ? "lg:flex-row lg:gap-6 lg:items-start" : "items-center"
            }`}
          >
            <div
              className={`min-w-0 w-full ${hasHistory ? "flex-1" : "max-w-xl"}`}
            >
              <AnalyzeForm onResult={setData} onLoadingChange={setLoading} />
            </div>
            {hasHistory && (
              <div className="w-full lg:w-80 lg:shrink-0">
                <PastDecisions
                  onSelect={setData}
                  currentData={data}
                  onHistoryChange={() => setHistoryVersion((v) => v + 1)}
                />
              </div>
            )}
          </div>

          {(loading || progress > 0) && (
          <div className="mb-6 sm:mb-8">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs sm:text-sm text-zinc-400">
              <span className="min-w-0 truncate">Analysis in progress</span>
              <span className="shrink-0">{Math.round(progress)}%</span>
            </div>
            <div className="w-full overflow-hidden rounded-lg bg-zinc-800/50 h-2">
              <div
                ref={barRef}
                className="h-full rounded-full bg-amber-500 block"
                style={{
                  width: `${progress}%`,
                  minWidth: progress > 0 ? "2px" : undefined,
                  transition: "none",
                }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Analysis in progress"
              />
            </div>
          </div>
          )}

          {data && (
          <>
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setData(null)}
                className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 active:scale-[0.98] min-h-[44px] sm:min-h-0 sm:py-1.5 sm:px-3"
              >
                Reset
              </button>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <ProblemSummaryCard data={data} />

              {/* Causes → Segments → Hypotheses */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-2 sm:p-3">
                <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-widest text-amber-500/60 sm:text-xs">
                  Problem analysis flow
                </p>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch sm:gap-2 xl:gap-4">
                  <div className="min-w-0 min-h-[100px] flex-1">
                    <CausesCard data={data} />
                  </div>
                  <FlowArrow className="hidden self-center sm:block" />
                  <FlowArrow direction="down" className="self-center py-1 sm:hidden" />
                  <div className="min-w-0 min-h-[100px] flex-1">
                    <SegmentsCard data={data} />
                  </div>
                  <FlowArrow className="hidden self-center sm:block" />
                  <FlowArrow direction="down" className="self-center py-1 sm:hidden" />
                  <div className="min-w-0 min-h-[100px] flex-1">
                    <HypothesesCard data={data} />
                  </div>
                </div>
              </div>

              {/* Experiments → Metrics */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-2 sm:p-3">
                <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-widest text-amber-500/60 sm:text-xs">
                  Experiment validation flow
                </p>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch sm:gap-2 xl:gap-4">
                  <div className="min-w-0 min-h-[100px] flex-1">
                    <ExperimentsCard data={data} />
                  </div>
                  <FlowArrow className="hidden self-center sm:block" />
                  <FlowArrow direction="down" className="self-center py-1 sm:hidden" />
                  <div className="min-w-0 min-h-[100px] flex-1">
                    <MetricsCard data={data} />
                  </div>
                </div>
              </div>
            </div>
          </>
          )}
        </div>
      </div>
    </main>
  );
}
