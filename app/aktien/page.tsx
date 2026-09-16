import { navSections } from "@/lib/navigation";
import { getQuotesResult } from "@/lib/data-sources/twelve-data";
import { STOCK_WATCHLIST } from "@/lib/watchlists";
import { StatusBadge } from "@/components/status-badge";
import { Watchlist } from "@/components/watchlist";

export default async function AktienPage() {
  const section = navSections.find((s) => s.href === "/aktien")!;
  const entries = await getQuotesResult(STOCK_WATCHLIST);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {section.label}
        </h1>
        <StatusBadge status={section.status} />
      </div>
      <p className="text-muted-foreground">Deine Watchlist.</p>
      <Watchlist entries={entries} />
    </div>
  );
}
