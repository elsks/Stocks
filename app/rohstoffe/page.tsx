import { navSections } from "@/lib/navigation";
import { getQuotesResult } from "@/lib/data-sources/twelve-data";
import { COMMODITY_WATCHLIST } from "@/lib/watchlists";
import { StatusBadge } from "@/components/status-badge";
import { Watchlist } from "@/components/watchlist";

export default async function RohstoffePage() {
  const section = navSections.find((s) => s.href === "/rohstoffe")!;
  const entries = await getQuotesResult(COMMODITY_WATCHLIST);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
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
    </div>
  );
}
