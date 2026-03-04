"use client";

interface SensitivityRangeProps {
  minScore: number;
  maxScore: number;
}

export function SensitivityRange({ minScore, maxScore }: SensitivityRangeProps) {
  if (!Number.isFinite(minScore) || !Number.isFinite(maxScore)) {
    return null;
  }

  const clampedMin = Math.min(minScore, maxScore);
  const clampedMax = Math.max(minScore, maxScore);

  // Normalize to a 0–1 range for the bar. We assume scores are roughly in [0, 100].
  const globalMin = 0;
  const globalMax = 100;
  const widthFactor = (clampedMax - clampedMin) / (globalMax - globalMin || 1);
  const offsetFactor = (clampedMin - globalMin) / (globalMax - globalMin || 1);

  const widthPercent = Math.max(0.04, Math.min(1, widthFactor)) * 100;
  const offsetPercent = Math.max(0, Math.min(100, offsetFactor * 100));

  return (
    <div className="space-y-1 text-[11px] text-zinc-300">
      <div className="flex items-center justify-between">
        <span className="text-zinc-500">Sensitivity range</span>
        <span className="font-medium">
          {clampedMin.toFixed(2)} – {clampedMax.toFixed(2)}
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-zinc-800/80">
        <div
          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-amber-500/70 via-amber-400/80 to-amber-300/80 shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
          style={{
            left: `${offsetPercent}%`,
            width: `${widthPercent}%`,
          }}
        />
      </div>
    </div>
  );
}

