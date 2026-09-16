import type { WatchlistEntry } from "@/lib/data-sources/twelve-data";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function Watchlist({ entries }: { entries: WatchlistEntry[] }) {
  const latestUpdate = entries
    .map((e) => ("quote" in e.result ? e.result.quote.asOf : null))
    .filter((v): v is string => v !== null)
    .sort()
    .at(-1);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {entries.map(({ symbol, result }, index) => (
          <div
            key={symbol}
            className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
              index > 0 ? "border-t border-border" : ""
            }`}
          >
            {"quote" in result ? (
              <>
                <div>
                  <div className="text-sm font-medium">{result.quote.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {result.quote.symbol}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums">
                    {result.quote.price.toLocaleString("de-DE", {
                      style: "currency",
                      currency: result.quote.currency,
                    })}
                  </span>
                  <span
                    className={`text-xs font-medium tabular-nums ${
                      result.quote.change >= 0
                        ? "text-accent"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {result.quote.change >= 0 ? "+" : ""}
                    {result.quote.changePercent.toFixed(2)} %
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-medium">{symbol}</div>
                <div className="text-xs text-red-600 dark:text-red-400">
                  {result.error}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Quelle: Twelve Data &middot; kostenloser Tarif, Kurse können leicht
        verzögert sein.
        {latestUpdate ? ` Stand: ${formatTimestamp(latestUpdate)}` : ""}
      </p>
    </div>
  );
}
