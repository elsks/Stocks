import Link from "next/link";
import type { RankedStock } from "@/lib/analysis/ranking";

export function RankingTable({ ranked }: { ranked: RankedStock[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {ranked.map((stock, index) => (
        <Link
          key={stock.symbol}
          href={`/aktien/${stock.symbol}`}
          className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-accent-soft ${
            index > 0 ? "border-t border-border" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-5 text-xs text-muted-foreground tabular-nums">
              {index + 1}
            </span>
            <div>
              <div className="text-sm font-medium">{stock.name}</div>
              <div className="text-xs text-muted-foreground">{stock.symbol}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
              {stock.criteriaMet}/{stock.criteriaEvaluable} Kriterien
            </span>
            <span className="tabular-nums text-muted-foreground">
              {stock.upsidePercent !== null
                ? `${stock.upsidePercent >= 0 ? "+" : ""}${stock.upsidePercent.toFixed(1)}% zum Kursziel`
                : "kein Kursziel"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
