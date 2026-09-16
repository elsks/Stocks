import { navSections } from "@/lib/navigation";
import { getCompanyFundamentalsResult } from "@/lib/data-sources/fmp";
import { evaluateCriteria } from "@/lib/analysis/valuation-criteria";
import { StatusBadge } from "@/components/status-badge";
import { DataError } from "@/components/data-error";
import { CriteriaGroup, CriteriaSummary } from "@/components/criteria-list";

const DEMO_SYMBOL = "AAPL";

export default async function UnternehmenPage() {
  const section = navSections.find((s) => s.href === "/unternehmen")!;
  const result = await getCompanyFundamentalsResult(DEMO_SYMBOL);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {section.label}
        </h1>
        <StatusBadge status={section.status} />
      </div>

      {"error" in result ? (
        <DataError message={result.error} />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-xl font-semibold">
                {result.fundamentals.profile.name}
              </h2>
              <span className="text-sm text-muted-foreground">
                {DEMO_SYMBOL}
                {result.fundamentals.profile.sector
                  ? ` · ${result.fundamentals.profile.sector}`
                  : ""}
              </span>
            </div>
            {result.fundamentals.profile.description && (
              <p className="text-sm text-muted-foreground">
                {result.fundamentals.profile.description}
              </p>
            )}
          </div>

          {(() => {
            const results = evaluateCriteria(result.fundamentals.metrics);
            const groups = [
              "Bewertung",
              "Qualität & Rentabilität",
              "Bilanz & Risiko",
            ] as const;

            return (
              <>
                <CriteriaSummary results={results} />
                {groups.map((group) => (
                  <CriteriaGroup
                    key={group}
                    title={group}
                    results={results.filter((r) => r.criterion.group === group)}
                  />
                ))}
              </>
            );
          })()}

          <p className="text-xs text-muted-foreground">
            Quelle: Financial Modeling Prep (End-of-Day-Daten, stündlich
            aktualisiert). Zielwerte stammen aus deinem eigenen Kriterienkatalog.
            Nicht abgebildet: Kennzahlen, die mehrjährige Historien oder
            Modellannahmen brauchen (z.B. Wachstumsraten, DCF, Moat-Einschätzung)
            &ndash; die folgen in einem späteren Schritt.
          </p>
        </>
      )}
    </div>
  );
}
