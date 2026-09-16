import { navSections } from "@/lib/navigation";
import { getUsEconomicEventsResult } from "@/lib/data-sources/economic-calendar";
import { getGeopoliticalNewsResult } from "@/lib/data-sources/geopolitical-news";
import { StatusBadge } from "@/components/status-badge";
import { EconomicEventList } from "@/components/economic-event-list";
import { NewsArticleList } from "@/components/news-article-list";
import { DataError } from "@/components/data-error";

export default async function NewsPage() {
  const section = navSections.find((s) => s.href === "/news")!;
  const [calendarResult, newsResult] = await Promise.all([
    getUsEconomicEventsResult(),
    getGeopoliticalNewsResult(),
  ]);

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
        {"events" in calendarResult ? (
          <EconomicEventList events={calendarResult.events} />
        ) : (
          <DataError message={calendarResult.error} />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-medium">Geopolitische News</h2>
          <p className="text-sm text-muted-foreground">
            Weltweite Ereignisse mit möglicher Marktrelevanz (Sanktionen,
            Handelskonflikte, Wahlen, Notenbanken, ...). Quelle: GNews,
            stündlich aktualisiert, Artikel auf Englisch.
          </p>
        </div>
        {"articles" in newsResult ? (
          <NewsArticleList articles={newsResult.articles} />
        ) : (
          <DataError message={newsResult.error} />
        )}
      </section>
    </div>
  );
}
