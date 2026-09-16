import type { Quote } from "@/lib/data-sources/twelve-data";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function QuoteCard({ quote }: { quote: Quote }) {
  const isPositive = quote.change >= 0;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">{quote.name}</div>
          <div className="text-sm text-muted-foreground">
            {quote.symbol} &middot; {quote.exchange}
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            quote.isMarketOpen
              ? "bg-accent-soft text-accent"
              : "border border-border text-muted-foreground"
          }`}
        >
          {quote.isMarketOpen ? "Markt offen" : "Markt geschlossen"}
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold tracking-tight">
          {quote.price.toLocaleString("de-DE", {
            style: "currency",
            currency: quote.currency,
          })}
        </span>
        <span
          className={`text-sm font-medium ${
            isPositive ? "text-accent" : "text-red-600 dark:text-red-400"
          }`}
        >
          {isPositive ? "+" : ""}
          {quote.change.toFixed(2)} ({isPositive ? "+" : ""}
          {quote.changePercent.toFixed(2)}%)
        </span>
      </div>

      <div className="border-t border-border pt-3 text-xs text-muted-foreground">
        Quelle: Twelve Data &middot; Stand: {formatTimestamp(quote.asOf)}
        <br />
        Hinweis: Kostenloser Tarif, Kurse können leicht verzögert sein.
      </div>
    </div>
  );
}
