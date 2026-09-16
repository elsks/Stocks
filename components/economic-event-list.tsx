import type { EconomicEvent } from "@/lib/data-sources/economic-calendar";

const impactStyles: Record<EconomicEvent["impact"], string> = {
  High: "bg-red-600 text-white dark:bg-red-500",
  Medium: "bg-orange-500 text-white dark:bg-orange-400 dark:text-orange-950",
};

const impactLabels: Record<EconomicEvent["impact"], string> = {
  High: "Hoch",
  Medium: "Mittel",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EconomicEventList({ events }: { events: EconomicEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-8 text-center text-sm text-muted-foreground">
        Aktuell keine wichtigen USD-Termine in dieser Woche.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((event, index) => (
        <div
          key={`${event.title}-${event.date}-${index}`}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${impactStyles[event.impact]}`}
            >
              {impactLabels[event.impact]}
            </span>
            <span className="font-medium">{event.title}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{formatDateTime(event.date)}</span>
            {event.forecast && <span>Prognose: {event.forecast}</span>}
            {event.previous && <span>Zuvor: {event.previous}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
