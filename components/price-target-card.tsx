import type { PriceTargetConsensus } from "@/lib/data-sources/fmp";

export function PriceTargetCard({ target }: { target: PriceTargetConsensus }) {
  const hasData =
    target.targetConsensus !== null ||
    target.targetHigh !== null ||
    target.targetLow !== null;

  if (!hasData) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-8 text-center text-sm text-muted-foreground">
        Keine Analysten-Kursziele verfügbar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-surface px-4 py-3">
        <div className="text-xs text-muted-foreground">Konsens</div>
        <div className="text-lg font-semibold tabular-nums">
          {target.targetConsensus?.toFixed(2) ?? "–"}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface px-4 py-3">
        <div className="text-xs text-muted-foreground">Tiefstes Ziel</div>
        <div className="text-lg font-semibold tabular-nums">
          {target.targetLow?.toFixed(2) ?? "–"}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface px-4 py-3">
        <div className="text-xs text-muted-foreground">Höchstes Ziel</div>
        <div className="text-lg font-semibold tabular-nums">
          {target.targetHigh?.toFixed(2) ?? "–"}
        </div>
      </div>
    </div>
  );
}
