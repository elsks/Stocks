import { navSections } from "@/lib/navigation";
import { STOCK_WATCHLIST } from "@/lib/watchlists";
import { getCompanyFundamentalsResult } from "@/lib/data-sources/fmp";
import { evaluateCriteria } from "@/lib/analysis/valuation-criteria";
import { StatusBadge } from "@/components/status-badge";
import {
  CompanySummaryCard,
  CompanySummaryError,
} from "@/components/company-summary-card";

export default async function UnternehmenPage() {
  const section = navSections.find((s) => s.href === "/unternehmen")!;
  const results = await Promise.all(
    STOCK_WATCHLIST.map(async (symbol) => ({
      symbol,
      result: await getCompanyFundamentalsResult(symbol),
    })),
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {section.label}
        </h1>
        <StatusBadge status={section.status} />
      </div>
      <p className="text-muted-foreground">
        Fundamentaldaten deiner Watchlist gegen deinen eigenen
        Kriterienkatalog. Für Details, Analysten-Kursziele und
        Unternehmens-News auf ein Unternehmen klicken.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {results.map(({ symbol, result }) =>
          "fundamentals" in result ? (
            <CompanySummaryCard
              key={symbol}
              symbol={symbol}
              name={result.fundamentals.profile.name}
              sector={result.fundamentals.profile.sector}
              results={evaluateCriteria(result.fundamentals.metrics)}
            />
          ) : (
            <CompanySummaryError key={symbol} symbol={symbol} message={result.error} />
          ),
        )}
      </div>
    </div>
  );
}
