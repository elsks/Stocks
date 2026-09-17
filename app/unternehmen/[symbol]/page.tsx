import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompanyFundamentalsResult,
  getCompanyNewsResult,
  getPriceTargetResult,
} from "@/lib/data-sources/fmp";
import { evaluateCriteria } from "@/lib/analysis/valuation-criteria";
import { STOCK_WATCHLIST } from "@/lib/watchlists";
import { DataError } from "@/components/data-error";
import { CriteriaGroup, CriteriaSummary } from "@/components/criteria-list";
import { PriceTargetCard } from "@/components/price-target-card";
import { CompanyNewsList } from "@/components/company-news-list";

export async function generateStaticParams() {
  return STOCK_WATCHLIST.map((symbol) => ({ symbol }));
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();

  if (!STOCK_WATCHLIST.includes(symbol)) {
    notFound();
  }

  const [fundamentalsResult, newsResult, priceTargetResult] = await Promise.all([
    getCompanyFundamentalsResult(symbol),
    getCompanyNewsResult(symbol),
    getPriceTargetResult(symbol),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <Link
        href="/unternehmen"
        className="text-sm text-muted-foreground hover:text-accent"
      >
        &larr; Zurück zur Übersicht
      </Link>

      {"error" in fundamentalsResult ? (
        <DataError message={fundamentalsResult.error} />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {fundamentalsResult.fundamentals.profile.name}
              </h1>
              <span className="text-sm text-muted-foreground">
                {symbol}
                {fundamentalsResult.fundamentals.profile.sector
                  ? ` · ${fundamentalsResult.fundamentals.profile.sector}`
                  : ""}
              </span>
            </div>
            {fundamentalsResult.fundamentals.profile.description && (
              <p className="text-sm text-muted-foreground">
                {fundamentalsResult.fundamentals.profile.description}
              </p>
            )}
          </div>

          {(() => {
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
          })()}

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
              <CompanyNewsList articles={newsResult.articles} />
            ) : (
              <DataError message={newsResult.error} />
            )}
          </section>

          <p className="text-xs text-muted-foreground">
            Quelle: Financial Modeling Prep (End-of-Day-Daten, stündlich
            aktualisiert). Zielwerte für die Fundamentaldaten stammen aus
            deinem eigenen Kriterienkatalog. Analysten-Kursziele und News sind
            Einschätzungen bzw. Berichte Dritter, keine eigene Bewertung durch
            diese Plattform.
          </p>
        </>
      )}
    </div>
  );
}
