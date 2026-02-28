"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

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
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              ← PM Decision Copilot
            </Link>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              Product Decision Dashboard
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              Structured reasoning: problem → causes → segments → hypotheses → experiments → metrics
            </p>
          </div>
        </header>

        <div className="mb-8 flex gap-6 flex-col lg:flex-row">
          <div className="flex-1">
            <AnalyzeForm onResult={setData} />
          </div>
          <div className="w-full lg:w-80 shrink-0">
            <PastDecisions onSelect={setData} currentData={data} />
          </div>
        </div>

        {data && (
          <>
            <section className="mb-10">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
                Reasoning layers
              </h2>
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

        {!data && (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 p-8 text-center">
            <p className="text-sm text-zinc-500">
              Enter a problem description and run analysis to see the decision dashboard
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
