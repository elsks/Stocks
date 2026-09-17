import type { OpportunityAnalysis } from "@/lib/ai/gemini";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Keine Angabe.</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-muted-foreground">&middot;</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function OpportunityAnalysisCard({
  title,
  analysis,
}: {
  title: string;
  analysis: OpportunityAnalysis;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
          KI-generiert &middot; {formatTimestamp(analysis.generatedAt)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-accent">
            Chancen
          </h4>
          <Bullets items={analysis.chancen} />
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
            Risiken
          </h4>
          <Bullets items={analysis.risiken} />
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Unsicherheiten
          </h4>
          <Bullets items={analysis.unsicherheiten} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Keine Kauf- oder Verkaufsempfehlung, sondern eine KI-Einschätzung
        basierend ausschließlich auf den auf dieser Plattform angezeigten
        Daten (Fundamentaldaten, News, Wirtschaftskalender, Geopolitik).
      </p>
    </div>
  );
}
