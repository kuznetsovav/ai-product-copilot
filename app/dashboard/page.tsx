"use client";

import { useState, useEffect, useRef } from "react";
import { AnalyzeForm, type DashboardData } from "@/ui/dashboard/analyze-form";
import { INTAKE_RESULT_KEY } from "@/lib/constants";
import {
  ProblemSummaryCard,
  CausesCard,
  SegmentsCard,
  HypothesesCard,
  ExperimentsCard,
  MetricsCard,
} from "@/ui/dashboard/cards";
import { DecisionLayers } from "@/ui/dashboard/decision-layers";
import { PastDecisions } from "@/ui/dashboard/past-decisions";

const PROGRESS_CAP = 99;
const PROGRESS_DURATION_MS = 28000; // time to reach 99% if job is slow

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
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
    <main className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            PM Decision Copilot
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Structured reasoning: problem → causes → segments → hypotheses → experiments → metrics
          </p>
        </header>

        <div className="mb-8 flex gap-6 flex-col lg:flex-row">
          <div className="flex-1">
            <AnalyzeForm onResult={setData} onLoadingChange={setLoading} />
          </div>
          <div className="w-full lg:w-80 shrink-0">
            <PastDecisions onSelect={setData} currentData={data} />
          </div>
        </div>

        {(loading || progress > 0) && (
          <div className="mb-8">
            <div className="mb-1.5 flex items-center justify-between text-sm text-zinc-400">
              <span>Analysis in progress</span>
              <span>{Math.round(progress)}%</span>
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
            <section className="mb-10">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
                  Reasoning layers
                </h2>
                <button
                  type="button"
                  onClick={() => setData(null)}
                  className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  Reset
                </button>
              </div>
              <DecisionLayers data={data} />
            </section>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <div className="sm:col-span-2 xl:col-span-3">
                <ProblemSummaryCard data={data} />
              </div>
              <CausesCard data={data} />
              <SegmentsCard data={data} />
              <HypothesesCard data={data} />
              <ExperimentsCard data={data} />
              <MetricsCard data={data} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
