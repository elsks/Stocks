import Link from "next/link";
import type { CriterionResult } from "@/lib/analysis/valuation-criteria";

export function CompanySummaryCard({
  symbol,
  name,
  sector,
  results,
}: {
  symbol: string;
  name: string;
  sector: string | null;
  results: CriterionResult[];
}) {
  const met = results.filter((r) => r.status === "met").length;
  const evaluable = results.filter((r) => r.status !== "unknown").length;

  return (
    <Link
      href={`/unternehmen/${symbol}`}
      className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">
            {symbol}
            {sector ? ` · ${sector}` : ""}
          </div>
        </div>
        <span className="whitespace-nowrap rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          {met}/{evaluable}
        </span>
      </div>
    </Link>
  );
}

export function CompanySummaryError({
  symbol,
  message,
}: {
  symbol: string;
  message: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-surface p-5">
      <div className="font-medium">{symbol}</div>
      <div className="text-xs text-red-600 dark:text-red-400">{message}</div>
    </div>
  );
}
