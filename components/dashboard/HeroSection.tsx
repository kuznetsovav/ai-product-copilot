"use client";

export function HeroSection() {
  return (
    <section className="mb-6 sm:mb-8 text-center">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
        AI Product Copilot
      </h1>
      <p className="mt-1 text-sm font-medium text-zinc-300 sm:text-base">
        Decision Intelligence for Product Managers
      </p>
      <p className="mt-2 text-sm text-zinc-400 max-w-2xl mx-auto">
        Transform vague product problems into structured, prioritized action plans.
      </p>
      <div className="mt-5 flex justify-center">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
      </div>
    </section>
  );
}

