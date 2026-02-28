"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { INTAKE_RESULT_KEY } from "@/lib/constants";
import { saveDecision } from "@/lib/store/decisions";

export default function IntakePage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, context: context || undefined }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Analysis failed");
        return;
      }
      saveDecision(data);
      sessionStorage.setItem(INTAKE_RESULT_KEY, JSON.stringify(data));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← PM Decision Copilot
        </Link>
        <div className="mt-6 text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Describe your product issue
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            What problem are you seeing? The clearer the description, the better the analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-200">
              Problem description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Users are dropping off at step 2 of signup. We see 70% abandonment between form submit and email verification. No clear pattern by segment yet."
              required
              rows={6}
              className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Include what you observe, who is affected, and any data you have.
            </p>
          </div>

          <div>
            <label htmlFor="context" className="block text-sm font-medium text-zinc-200">
              Additional context (optional)
            </label>
            <textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Product area, business context, recent changes, constraints..."
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-600 px-4 py-3 text-sm font-medium text-zinc-900 transition hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Analyzing…" : "Analyze problem"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Your issue will be analyzed to produce causes, segments, hypotheses, and experiments.
        </p>
      </div>
    </main>
  );
}
