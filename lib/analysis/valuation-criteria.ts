import type { FundamentalMetrics } from "@/lib/data-sources/fmp";

export type CriterionStatus = "met" | "not-met" | "unknown";

export interface Criterion {
  key: keyof FundamentalMetrics;
  label: string;
  group: "Bewertung" | "Qualität & Rentabilität" | "Bilanz & Risiko";
  unit: "ratio" | "percent";
  target: string;
  note?: string;
  evaluate: (value: number) => boolean;
}

export const criteria: Criterion[] = [
  {
    key: "peRatio",
    label: "KGV (P/E)",
    group: "Bewertung",
    unit: "ratio",
    target: "10 – 25",
    evaluate: (v) => v >= 10 && v <= 25,
  },
  {
    key: "priceToSales",
    label: "KUV (P/S)",
    group: "Bewertung",
    unit: "ratio",
    target: "< 5",
    evaluate: (v) => v < 5,
  },
  {
    key: "priceToFreeCashFlow",
    label: "KCV (P/FCF)",
    group: "Bewertung",
    unit: "ratio",
    target: "< 20",
    evaluate: (v) => v < 20,
  },
  {
    key: "evToEbitda",
    label: "EV/EBITDA",
    group: "Bewertung",
    unit: "ratio",
    target: "< 15",
    evaluate: (v) => v < 15,
  },
  {
    key: "priceToBook",
    label: "KBV (P/B)",
    group: "Bewertung",
    unit: "ratio",
    target: "< 3",
    evaluate: (v) => v < 3,
  },
  {
    key: "dividendYieldPercent",
    label: "Dividendenrendite",
    group: "Bewertung",
    unit: "percent",
    target: "2 – 4 %",
    note: "> 5 % gilt im Cheat Sheet oft als Warnsignal, nicht automatisch positiv.",
    evaluate: (v) => v >= 2 && v <= 4,
  },
  {
    key: "roicPercent",
    label: "ROIC",
    group: "Qualität & Rentabilität",
    unit: "percent",
    target: "≥ 15 %",
    evaluate: (v) => v >= 15,
  },
  {
    key: "roePercent",
    label: "ROE",
    group: "Qualität & Rentabilität",
    unit: "percent",
    target: "≥ 15 %",
    evaluate: (v) => v >= 15,
  },
  {
    key: "fcfMarginPercent",
    label: "FCF-Marge",
    group: "Qualität & Rentabilität",
    unit: "percent",
    target: "≥ 15 %",
    evaluate: (v) => v >= 15,
  },
  {
    key: "netMarginPercent",
    label: "Nettomarge",
    group: "Qualität & Rentabilität",
    unit: "percent",
    target: "≥ 15 %",
    evaluate: (v) => v >= 15,
  },
  {
    key: "grossMarginPercent",
    label: "Bruttomarge",
    group: "Qualität & Rentabilität",
    unit: "percent",
    target: "≥ 30 %",
    note: "Branchenabhängig (SaaS eher >50–60 %, Industrie eher >30–40 %) – allgemeiner Richtwert.",
    evaluate: (v) => v >= 30,
  },
  {
    key: "equityRatioPercent",
    label: "Eigenkapitalquote",
    group: "Bilanz & Risiko",
    unit: "percent",
    target: "≥ 40 %",
    evaluate: (v) => v >= 40,
  },
  {
    key: "debtToEquity",
    label: "Debt/Equity",
    group: "Bilanz & Risiko",
    unit: "ratio",
    target: "< 1,0",
    evaluate: (v) => v < 1,
  },
  {
    key: "netDebtToEbitda",
    label: "Net Debt/EBITDA",
    group: "Bilanz & Risiko",
    unit: "ratio",
    target: "< 2,5x",
    evaluate: (v) => v < 2.5,
  },
  {
    key: "interestCoverage",
    label: "Zinsdeckungsgrad",
    group: "Bilanz & Risiko",
    unit: "ratio",
    target: "≥ 5x",
    evaluate: (v) => v >= 5,
  },
];

export interface CriterionResult {
  criterion: Criterion;
  value: number | null;
  status: CriterionStatus;
}

export function evaluateCriteria(metrics: FundamentalMetrics): CriterionResult[] {
  return criteria.map((criterion) => {
    const value = metrics[criterion.key];
    if (value === null) {
      return { criterion, value: null, status: "unknown" as const };
    }
    return {
      criterion,
      value,
      status: criterion.evaluate(value) ? ("met" as const) : ("not-met" as const),
    };
  });
}
