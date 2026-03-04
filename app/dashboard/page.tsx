 "use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { DashboardData } from "@/ui/dashboard/analyze-form";
import { INTAKE_RESULT_KEY } from "@/lib/constants";
import { getDecisions, saveDecision } from "@/lib/store/decisions";
import { PastDecisions } from "@/ui/dashboard/past-decisions";
import type { PrioritizedExperiment } from "@/lib/types/prioritization";
import { RiceModel, IceModel, type ScoringModel } from "@/lib/prioritization/ScoringModel";
import { computeSensitivityRange } from "@/lib/prioritization/Sensitivity";
import { ProblemSummarySection } from "@/components/results/ProblemSummarySection";
import { RecommendedFocusSection } from "@/components/results/RecommendedFocusSection";
import { PrioritizedExperimentsSection } from "@/components/results/PrioritizedExperimentsSection";
import { useRecommendation } from "@/hooks/useRecommendation";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { WhatYouGetSection } from "@/components/dashboard/WhatYouGetSection";
import { HowItWorksSection } from "@/components/dashboard/HowItWorksSection";
import { ProblemInputSection } from "@/components/dashboard/ProblemInputSection";

const PROGRESS_CAP = 99;
const PROGRESS_DURATION_MS = 28000; // time to reach 99% if job is slow

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [hasHistory, setHasHistory] = useState(false);
  const [scoringModelName, setScoringModelName] = useState<"rice" | "ice">("rice");
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
    setHasHistory(getDecisions().length > 0);
  }, [historyVersion]);

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

  const scoringModel: ScoringModel = useMemo(
    () => (scoringModelName === "rice" ? new RiceModel() : new IceModel()),
    [scoringModelName]
  );

  const prioritizedForDisplay: PrioritizedExperiment[] | null = useMemo(() => {
    if (!data?.prioritizedExperiments || data.prioritizedExperiments.length === 0) {
      return null;
    }
    const recomputed = data.prioritizedExperiments.map((exp) => {
      const compositeScore = scoringModel.compute(
        exp.impactScore,
        exp.effortScore,
        exp.confidenceScore,
        exp.riskScore
      );
      const sensitivityRange = computeSensitivityRange(
        exp.impactScore,
        exp.effortScore,
        exp.confidenceScore,
        exp.riskScore,
        scoringModel
      );
      return {
        ...exp,
        compositeScore,
        sensitivityRange,
      };
    });
    return recomputed.sort((a, b) => b.compositeScore - a.compositeScore);
  }, [data?.prioritizedExperiments, scoringModel]);

  const { recommendedExperiment, restExperiments } = useRecommendation(
    prioritizedForDisplay
  );

  async function handleProblemSubmit(payload: {
    description: string;
    context?: string;
    northStarMetric?: string;
    productStage?: string;
    teamSize?: number;
    riskTolerance?: string;
  }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        setError(
          typeof json.error === "string"
            ? json.error
            : "Analysis failed. Please check your input and try again."
        );
        return;
      }
      saveDecision(json);
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-[var(--background)]">
      <div className="flex w-full justify-center">
        <div className="w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <HeroSection />
          <WhatYouGetSection />
          <HowItWorksSection />

          <div
            className={`mb-6 sm:mb-8 flex flex-col gap-4 ${
              hasHistory ? "lg:flex-row lg:gap-6 lg:items-start" : "items-center"
            }`}
          >
            <div
              className={`min-w-0 w-full ${hasHistory ? "flex-1" : "max-w-xl"}`}
            >
              <ProblemInputSection
                onSubmit={handleProblemSubmit}
                loading={loading}
                error={error}
              />
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
                <ProblemSummarySection data={data} />

                <RecommendedFocusSection
                  recommendedExperiment={recommendedExperiment}
                  data={data}
                />

                <PrioritizedExperimentsSection
                  prioritizedExperiments={restExperiments}
                  data={data}
                  scoringModelName={scoringModelName}
                  onScoringModelChange={setScoringModelName}
                  warning={data.prioritizationError}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
