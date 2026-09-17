import { unstable_cache } from "next/cache";
import { getCompanyFundamentals } from "@/lib/data-sources/fmp";
import { getCompanyNewsResult, getGeopoliticalNewsResult } from "@/lib/data-sources/gnews";
import { getUsEconomicEvents } from "@/lib/data-sources/economic-calendar";
import { evaluateCriteria } from "@/lib/analysis/valuation-criteria";
import {
  generateOpportunityAnalysis,
  AiError,
  type OpportunityAnalysis,
} from "@/lib/ai/gemini";

const REVALIDATE_SECONDS = 4 * 60 * 60;

export interface StockOpportunityData {
  name: string;
  sector: string | null;
  criteriaMet: number;
  criteriaEvaluable: number;
  analysis: OpportunityAnalysis;
}

async function buildStockAnalysis(symbol: string): Promise<StockOpportunityData> {
  const fundamentals = await getCompanyFundamentals(symbol);
  const criteriaResults = evaluateCriteria(fundamentals.metrics);
  const met = criteriaResults.filter((r) => r.status === "met").length;
  const evaluable = criteriaResults.filter((r) => r.status !== "unknown").length;

  const [newsResult, geoResult, events] = await Promise.all([
    getCompanyNewsResult(symbol, fundamentals.profile.name),
    getGeopoliticalNewsResult(),
    getUsEconomicEvents().catch(() => []),
  ]);

  const criteriaLines = criteriaResults
    .map(
      (r) =>
        `- ${r.criterion.label}: ${r.value?.toFixed(2) ?? "keine Daten"} (Ziel: ${r.criterion.target}, Status: ${r.status})`,
    )
    .join("\n");

  const newsLines =
    "articles" in newsResult && newsResult.articles.length > 0
      ? newsResult.articles
          .slice(0, 5)
          .map((a) => `- ${a.title} (${a.sourceName})`)
          .join("\n")
      : "Keine aktuellen Unternehmens-News verfügbar.";

  const geoLines =
    "articles" in geoResult && geoResult.articles.length > 0
      ? geoResult.articles
          .slice(0, 3)
          .map((a) => `- ${a.title} (${a.sourceName})`)
          .join("\n")
      : "Keine aktuellen geopolitischen Schlagzeilen verfügbar.";

  const now = Date.now();
  const upcomingEvents = events
    .filter((e) => new Date(e.date).getTime() > now)
    .slice(0, 5)
    .map((e) => `- ${e.title} (${e.impact}, ${e.date})`)
    .join("\n");

  const contextText = `
Fundamentaldaten-Kriterien (${met} von ${evaluable} bewertbaren Kriterien erfüllt):
${criteriaLines}

Aktuelle Unternehmens-News:
${newsLines}

Bevorstehende US-Wirtschaftstermine:
${upcomingEvents || "Keine wichtigen Termine in den nächsten Tagen bekannt."}

Aktuelle geopolitische Lage (marktrelevant):
${geoLines}
`.trim();

  const analysis = await generateOpportunityAnalysis(fundamentals.profile.name, contextText);

  return {
    name: fundamentals.profile.name,
    sector: fundamentals.profile.sector,
    criteriaMet: met,
    criteriaEvaluable: evaluable,
    analysis,
  };
}

const cachedBuildStockAnalysis = unstable_cache(
  buildStockAnalysis,
  ["stock-opportunity-analysis"],
  { revalidate: REVALIDATE_SECONDS },
);

export type StockOpportunityResult =
  | { data: StockOpportunityData }
  | { error: string };

export async function getStockOpportunityResult(
  symbol: string,
): Promise<StockOpportunityResult> {
  try {
    return { data: await cachedBuildStockAnalysis(symbol) };
  } catch (error) {
    return {
      error:
        error instanceof AiError || error instanceof Error
          ? error.message
          : "Unerwarteter Fehler bei der KI-Analyse.",
    };
  }
}
