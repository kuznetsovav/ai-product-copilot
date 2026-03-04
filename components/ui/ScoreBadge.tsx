"use client";

interface ScoreBadgeProps {
  label: string;
  value: number; // expected 1–10
}

export function ScoreBadge({ label, value }: ScoreBadgeProps) {
  const clamped = Math.min(10, Math.max(1, value));
  const ratio = (clamped - 1) / 9; // 0 (1) -> 1 (10)
  const hue = 10 + 110 * ratio; // from red-ish to green-ish

  const background = `linear-gradient(135deg, hsl(${hue}, 70%, 18%), hsl(${hue}, 80%, 28%))`;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-50 shadow-sm shadow-black/30"
      style={{ background }}
    >
      <span className="uppercase tracking-wide text-[9px] text-zinc-200/80">
        {label}
      </span>
      <span className="text-xs font-semibold">{clamped.toFixed(1)}</span>
    </span>
  );
}

