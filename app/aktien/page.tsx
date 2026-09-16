import { navSections } from "@/lib/navigation";
import { getQuoteResult } from "@/lib/data-sources/twelve-data";
import { StatusBadge } from "@/components/status-badge";
import { QuoteCard } from "@/components/quote-card";
import { DataError } from "@/components/data-error";

const DEMO_SYMBOL = "AAPL";

export const dynamic = "force-dynamic";

export default async function AktienPage() {
  const section = navSections.find((s) => s.href === "/aktien")!;
  const result = await getQuoteResult(DEMO_SYMBOL);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {section.label}
        </h1>
        <StatusBadge status={section.status} />
      </div>
      <p className="text-muted-foreground">
        Beispielhaft ein einzelner Live-Kurs ({DEMO_SYMBOL}) &ndash; eine
        echte Watchlist mit mehreren Aktien folgt in einem späteren Schritt.
      </p>
      {"quote" in result ? (
        <QuoteCard quote={result.quote} />
      ) : (
        <DataError message={result.error} />
      )}
    </div>
  );
}
