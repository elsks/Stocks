import { navSections } from "@/lib/navigation";
import { getUsEconomicEventsResult } from "@/lib/data-sources/economic-calendar";
import { StatusBadge } from "@/components/status-badge";
import { EconomicEventList } from "@/components/economic-event-list";
import { DataError } from "@/components/data-error";

export default async function NewsPage() {
  const section = navSections.find((s) => s.href === "/news")!;
  const result = await getUsEconomicEventsResult();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {section.label}
        </h1>
        <StatusBadge status={section.status} />
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-medium">US-Wirtschaftsdaten</h2>
          <p className="text-sm text-muted-foreground">
            Wichtige USD-Termine dieser Woche (CPI, PPI, Zinsentscheide,
            Pressekonferenzen, ...), farblich nach Relevanz markiert. Quelle:
            offizieller Kalender-Export von Forex Factory, stündlich
            aktualisiert.
          </p>
        </div>
        {"events" in result ? (
          <EconomicEventList events={result.events} />
        ) : (
          <DataError message={result.error} />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-medium">Geopolitische News</h2>
          <p className="text-sm text-muted-foreground">
            Folgt im nächsten Schritt, sobald eine geeignete Nachrichten-Quelle
            ausgewählt ist.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-8 text-center text-sm text-muted-foreground">
          Noch keine Quelle angebunden.
        </div>
      </section>
    </div>
  );
}
