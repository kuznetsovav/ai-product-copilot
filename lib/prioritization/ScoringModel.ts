export interface ScoringModel {
  compute(
    impact: number,
    effort: number,
    confidence: number,
    risk: number
  ): number;
}

/**
 * RICE-style scoring model with a simple risk adjustment factor.
 *
 * Formula (unnormalized):
 *   base = (impact * confidence) / effort
 *   riskAdjustment = 1 - (risk / 20)
 *   score = base * riskAdjustment
 */
export class RiceModel implements ScoringModel {
  compute(
    impact: number,
    effort: number,
    confidence: number,
    risk: number
  ): number {
    const safeEffort = effort <= 0 ? 1 : effort;
    const base = (impact * confidence) / safeEffort;

    // risk expected in ~[0, 10]; adjustment in [0.5, 1]
    const boundedRisk = Math.min(Math.max(risk, 0), 20);
    const riskAdjustment = 1 - boundedRisk / 20;

    return base * riskAdjustment;
  }
}

/**
 * ICE-style scoring model (ignores risk).
 *
 * Formula (unnormalized):
 *   score = (impact * confidence) / effort
 */
export class IceModel implements ScoringModel {
  compute(
    impact: number,
    effort: number,
    confidence: number,
    _risk: number
  ): number {
    const safeEffort = effort <= 0 ? 1 : effort;
    return (impact * confidence) / safeEffort;
  }
}

