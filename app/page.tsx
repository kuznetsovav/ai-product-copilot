import Link from "next/link";
import { DecisionProvider } from "@/ui/decision-context";
import { DecisionForm } from "@/ui/decision-form";
import { ResultsPanel } from "@/ui/results-panel";

export default function HomePage() {
  return (
    <DecisionProvider>
    <main className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            PM Decision Copilot
          </h1>
          <p className="mt-2 text-base text-zinc-400">
            Turn vague product problems into structured decisions
          </p>
          <div className="mt-3 flex gap-4">
            <Link
              href="/intake"
              className="text-sm font-medium text-amber-500 hover:text-amber-400"
            >
              Describe a problem →
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-500 hover:text-zinc-400"
            >
              Open dashboard
            </Link>
          </div>
        </header>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <DecisionForm />
          <ResultsPanel />
        </div>
      </div>
    </main>
    </DecisionProvider>
  );
}
