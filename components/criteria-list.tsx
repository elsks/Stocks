import type { CriterionResult, CriterionStatus } from "@/lib/analysis/valuation-criteria";

const statusStyles: Record<CriterionStatus, string> = {
  met: "bg-accent-soft text-accent",
  "not-met": "border border-red-600/40 text-red-600 dark:text-red-400",
  unknown: "border border-border text-muted-foreground",
};

const statusLabels: Record<CriterionStatus, string> = {
  met: "Erfüllt",
  "not-met": "Nicht erfüllt",
  unknown: "Keine Daten",
};

function formatValue(value: number | null, unit: "ratio" | "percent") {
  if (value === null) return "–";
  const formatted = value.toLocaleString("de-DE", { maximumFractionDigits: 2 });
  return unit === "percent" ? `${formatted} %` : formatted;
}

export function CriteriaGroup({
  title,
  results,
}: {
  title: string;
  results: CriterionResult[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-medium">{title}</h3>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {results.map(({ criterion, value, status }, index) => (
          <div
            key={criterion.key}
            className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
              index > 0 ? "border-t border-border" : ""
            }`}
          >
            <div>
              <div className="text-sm font-medium">{criterion.label}</div>
              <div className="text-xs text-muted-foreground">
                Ziel: {criterion.target}
                {criterion.note ? ` · ${criterion.note}` : ""}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm tabular-nums">
                {formatValue(value, criterion.unit)}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
              >
                {statusLabels[status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CriteriaSummary({ results }: { results: CriterionResult[] }) {
  const met = results.filter((r) => r.status === "met").length;
  const evaluable = results.filter((r) => r.status !== "unknown").length;

  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-4">
      <div className="text-lg font-semibold tracking-tight">
        {met} von {evaluable} bewertbaren Kriterien erfüllt
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Rein regelbasierter Abgleich mit deinen eigenen Zielwerten – keine
        Kauf- oder Verkaufsempfehlung, sondern nur: erfüllt das Unternehmen
        dieses konkrete Kriterium oder nicht.
      </p>
    </div>
  );
}
