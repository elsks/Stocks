import { navSections } from "@/lib/navigation";
import { STOCK_WATCHLIST } from "@/lib/watchlists";
import { getQuotesResult } from "@/lib/data-sources/twelve-data";
import { getCompanyFundamentalsResult, getPriceTargetResult } from "@/lib/data-sources/fmp";
import { evaluateCriteria } from "@/lib/analysis/valuation-criteria";
import { rankStocks } from "@/lib/analysis/ranking";
import { getStockOpportunityResult } from "@/lib/ai/stock-opportunity";
import { StatusBadge } from "@/components/status-badge";
import { RankingTable } from "@/components/ranking-table";
import { OpportunityAnalysisCard } from "@/components/opportunity-analysis-card";
import { DataError } from "@/components/data-error";

export default async function ChancenRisikenPage() {
  const section = navSections.find((s) => s.href === "/chancen-risiken")!;

  const quotes = await getQuotesResult(STOCK_WATCHLIST);
  const [fundamentalsResults, priceTargetResults, opportunityResults] = await Promise.all([
    Promise.all(STOCK_WATCHLIST.map((s) => getCompanyFundamentalsResult(s))),
    Promise.all(STOCK_WATCHLIST.map((s) => getPriceTargetResult(s))),
    Promise.all(STOCK_WATCHLIST.map((s) => getStockOpportunityResult(s))),
  ]);

  const rankingEntries = STOCK_WATCHLIST.map((symbol, i) => {
    const fundamentals = fundamentalsResults[i];
    const priceTarget = priceTargetResults[i];
    const quote = quotes.find((q) => q.symbol === symbol)?.result;

    return {
      symbol,
      name: "fundamentals" in fundamentals ? fundamentals.fundamentals.profile.name : symbol,
      criteriaResults:
        "fundamentals" in fundamentals
          ? evaluateCriteria(fundamentals.fundamentals.metrics)
          : [],
      currentPrice: quote && "quote" in quote ? quote.quote.price : null,
      targetConsensus: "target" in priceTarget ? priceTarget.target.targetConsensus : null,
    };
  });

  const ranked = rankStocks(rankingEntries);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {section.label}
        </h1>
        <StatusBadge status={section.status} />
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-medium">Ranking</h2>
          <p className="text-sm text-muted-foreground">
            Rein rechnerisch: erfüllte Fundamentalkriterien und Abstand zum
            Analysten-Kursziel. Keine KI, keine Meinung – nur Zahlenvergleich
            deiner Watchlist.
          </p>
        </div>
        <RankingTable ranked={ranked} />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-medium">KI-Einschätzung je Aktie</h2>
          <p className="text-sm text-muted-foreground">
            Wird alle paar Stunden neu erzeugt, nicht bei jedem Seitenaufruf.
            Basiert nur auf den Daten, die du auch sonst auf dieser Plattform
            siehst.
          </p>
        </div>
        {ranked.map((stock) => {
          const result = opportunityResults[STOCK_WATCHLIST.indexOf(stock.symbol)];
          return "analysis" in result ? (
            <OpportunityAnalysisCard
              key={stock.symbol}
              title={`${stock.name} (${stock.symbol})`}
              analysis={result.analysis}
            />
          ) : (
            <div key={stock.symbol} className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">
                {stock.name} ({stock.symbol})
              </h3>
              <DataError message={result.error} />
            </div>
          );
        })}
      </section>
    </div>
  );
}
