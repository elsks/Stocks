export interface RankedStock {
  symbol: string;
  name: string;
  criteriaMet: number;
  criteriaEvaluable: number;
  upsidePercent: number | null;
}

export function rankStocks(
  entries: {
    symbol: string;
    name: string;
    criteriaMet: number;
    criteriaEvaluable: number;
    currentPrice: number | null;
    targetConsensus: number | null;
  }[],
): RankedStock[] {
  return entries
    .map((entry) => ({
      symbol: entry.symbol,
      name: entry.name,
      criteriaMet: entry.criteriaMet,
      criteriaEvaluable: entry.criteriaEvaluable,
      upsidePercent:
        entry.currentPrice && entry.targetConsensus
          ? ((entry.targetConsensus - entry.currentPrice) / entry.currentPrice) * 100
          : null,
    }))
    .sort((a, b) => {
      const scoreA = a.criteriaEvaluable > 0 ? a.criteriaMet / a.criteriaEvaluable : -1;
      const scoreB = b.criteriaEvaluable > 0 ? b.criteriaMet / b.criteriaEvaluable : -1;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.upsidePercent ?? -Infinity) - (a.upsidePercent ?? -Infinity);
    });
}
