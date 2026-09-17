import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuoteResult } from "@/lib/data-sources/twelve-data";
import {
  getCompanyFundamentalsResult,
  getPriceTargetResult,
} from "@/lib/data-sources/fmp";
import { getCompanyNewsResult } from "@/lib/data-sources/gnews";
import { evaluateCriteria } from "@/lib/analysis/valuation-criteria";
import { STOCK_WATCHLIST } from "@/lib/watchlists";
import { DataError } from "@/components/data-error";
import { CriteriaGroup, CriteriaSummary } from "@/components/criteria-list";
import { PriceTargetCard } from "@/components/price-target-card";
import { NewsArticleList } from "@/components/news-article-list";

export async function generateStaticParams() {
  return STOCK_WATCHLIST.map((symbol) => ({ symbol }));
}

export default async function StockPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();

  if (!STOCK_WATCHLIST.includes(symbol)) {
    notFound();
  }

  const fundamentalsResult = await getCompanyFundamentalsResult(symbol);
  const companyName =
    "fundamentals" in fundamentalsResult
      ? fundamentalsResult.fundamentals.profile.name
      : symbol;

  const [quoteResult, newsResult, priceTargetResult] = await Promise.all([
    getQuoteResult(symbol),
    getCompanyNewsResult(symbol, companyName),
    getPriceTargetResult(symbol),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <Link
        href="/aktien"
        className="text-sm text-muted-foreground hover:text-accent"
      >
        &larr; Zurück zur Watchlist
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {companyName}
          </h1>
          <span className="text-sm text-muted-foreground">
            {symbol}
            {"fundamentals" in fundamentalsResult &&
            fundamentalsResult.fundamentals.profile.sector
              ? ` · ${fundamentalsResult.fundamentals.profile.sector}`
              : ""}
          </span>
        </div>
        {"fundamentals" in fundamentalsResult &&
          fundamentalsResult.fundamentals.profile.description && (
            <p className="text-sm text-muted-foreground">
              {fundamentalsResult.fundamentals.profile.description}
            </p>
          )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Kurs</h2>
        {"quote" in quoteResult ? (
          <div className="flex flex-wrap items-baseline gap-3 rounded-xl border border-border bg-surface px-5 py-4">
            <span className="text-2xl font-semibold tabular-nums">
              {quoteResult.quote.price.toLocaleString("de-DE", {
                style: "currency",
                currency: quoteResult.quote.currency,
              })}
            </span>
            <span
              className={`text-sm font-medium tabular-nums ${
                quoteResult.quote.change >= 0
                  ? "text-accent"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {quoteResult.quote.change >= 0 ? "+" : ""}
              {quoteResult.quote.change.toFixed(2)} (
              {quoteResult.quote.change >= 0 ? "+" : ""}
              {quoteResult.quote.changePercent.toFixed(2)}%)
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {quoteResult.quote.isMarketOpen ? "Markt offen" : "Markt geschlossen"}
            </span>
          </div>
        ) : (
          <DataError message={quoteResult.error} />
        )}
      </section>

      {"error" in fundamentalsResult ? (
        <DataError message={fundamentalsResult.error} />
      ) : (
        (() => {
          const results = evaluateCriteria(fundamentalsResult.fundamentals.metrics);
          const groups = [
            "Bewertung",
            "Qualität & Rentabilität",
            "Bilanz & Risiko",
          ] as const;

          return (
            <section className="flex flex-col gap-3">
              <h2 className="font-medium">Fundamentaldaten</h2>
              <CriteriaSummary results={results} />
              {groups.map((group) => (
                <CriteriaGroup
                  key={group}
                  title={group}
                  results={results.filter((r) => r.criterion.group === group)}
                />
              ))}
            </section>
          );
        })()
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Analysten-Kursziele</h2>
        {"target" in priceTargetResult ? (
          <PriceTargetCard target={priceTargetResult.target} />
        ) : (
          <DataError message={priceTargetResult.error} />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Unternehmens-News</h2>
        {"articles" in newsResult ? (
          <NewsArticleList articles={newsResult.articles} />
        ) : (
          <DataError message={newsResult.error} />
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Kurs: Twelve Data. Fundamentaldaten und Kursziele: Financial Modeling
        Prep (End-of-Day-Daten, stündlich aktualisiert). News: GNews, Artikel
        auf Englisch. Zielwerte für die Fundamentaldaten stammen aus deinem
        eigenen Kriterienkatalog. Kursziele und News sind Einschätzungen bzw.
        Berichte Dritter, keine eigene Bewertung durch diese Plattform.
      </p>
    </div>
  );
}
