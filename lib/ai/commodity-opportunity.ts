import { unstable_cache } from "next/cache";
import { getQuoteResult } from "@/lib/data-sources/twelve-data";
import { getGeopoliticalNewsResult } from "@/lib/data-sources/gnews";
import { getUsEconomicEvents } from "@/lib/data-sources/economic-calendar";
import {
  generateOpportunityAnalysis,
  AiError,
  type OpportunityAnalysis,
} from "@/lib/ai/gemini";

const REVALIDATE_SECONDS = 6 * 60 * 60;

async function buildCommodityAnalysis(symbol: string): Promise<OpportunityAnalysis> {
  const [quoteResult, geoResult, events] = await Promise.all([
    getQuoteResult(symbol),
    getGeopoliticalNewsResult(),
    getUsEconomicEvents().catch(() => []),
  ]);

  const label = "quote" in quoteResult ? quoteResult.quote.name : symbol;

  const priceLine =
    "quote" in quoteResult
      ? `- Aktueller Kurs: ${quoteResult.quote.price} ${quoteResult.quote.currency} (${quoteResult.quote.change >= 0 ? "+" : ""}${quoteResult.quote.changePercent.toFixed(2)}% seit letztem Schlusskurs)`
      : "- Kein aktueller Kurs verfügbar.";

  const geoLines =
    "articles" in geoResult && geoResult.articles.length > 0
      ? geoResult.articles
          .slice(0, 5)
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
Kursdaten:
${priceLine}

Bevorstehende US-Wirtschaftstermine (relevant für USD-Kurs und damit für dieses Asset):
${upcomingEvents || "Keine wichtigen Termine in den nächsten Tagen bekannt."}

Aktuelle geopolitische Lage:
${geoLines}
`.trim();

  return generateOpportunityAnalysis(label, contextText);
}

const cachedBuildCommodityAnalysis = unstable_cache(
  buildCommodityAnalysis,
  ["commodity-opportunity-analysis"],
  { revalidate: REVALIDATE_SECONDS },
);

export type CommodityOpportunityResult =
  | { analysis: OpportunityAnalysis }
  | { error: string };

export async function getCommodityOpportunityResult(
  symbol: string,
): Promise<CommodityOpportunityResult> {
  try {
    return { analysis: await cachedBuildCommodityAnalysis(symbol) };
  } catch (error) {
    return {
      error:
        error instanceof AiError || error instanceof Error
          ? error.message
          : "Unerwarteter Fehler bei der KI-Analyse.",
    };
  }
}
