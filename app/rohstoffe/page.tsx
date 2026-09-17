import { navSections } from "@/lib/navigation";
import { getQuotesResult } from "@/lib/data-sources/twelve-data";
import { COMMODITY_WATCHLIST } from "@/lib/watchlists";
import { getCommodityOpportunityResult } from "@/lib/ai/commodity-opportunity";
import { StatusBadge } from "@/components/status-badge";
import { Watchlist } from "@/components/watchlist";
import { OpportunityAnalysisCard } from "@/components/opportunity-analysis-card";
import { DataError } from "@/components/data-error";

export default async function RohstoffePage() {
  const section = navSections.find((s) => s.href === "/rohstoffe")!;
  const [entries, opportunityResults] = await Promise.all([
    getQuotesResult(COMMODITY_WATCHLIST),
    Promise.all(COMMODITY_WATCHLIST.map((s) => getCommodityOpportunityResult(s))),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {section.label}
        </h1>
        <StatusBadge status={section.status} />
      </div>
      <p className="text-muted-foreground">
        Gold, Rohöl (WTI) und Silber.
      </p>
      <Watchlist entries={entries} />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-medium">KI-Einschätzung</h2>
          <p className="text-sm text-muted-foreground">
            Wird alle paar Stunden neu erzeugt, unabhängig von den
            Aktien-Analysen (eigenes Zeitfenster, damit sich beide nicht
            gegenseitig ins Anfrage-Limit laufen).
          </p>
        </div>
        {COMMODITY_WATCHLIST.map((symbol, i) => {
          const result = opportunityResults[i];
          const entry = entries.find((e) => e.symbol === symbol);
          const label =
            entry && "quote" in entry.result ? entry.result.quote.name : symbol;

          return "analysis" in result ? (
            <OpportunityAnalysisCard
              key={symbol}
              title={label}
              analysis={result.analysis}
            />
          ) : (
            <div key={symbol} className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">{label}</h3>
              <DataError message={result.error} />
            </div>
          );
        })}
      </section>
    </div>
  );
}
