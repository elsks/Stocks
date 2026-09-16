const CALENDAR_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
const REVALIDATE_SECONDS = 60 * 60;

export type ImpactLevel = "High" | "Medium";

export interface EconomicEvent {
  title: string;
  country: string;
  date: string;
  impact: ImpactLevel;
  forecast: string | null;
  previous: string | null;
}

export class CalendarError extends Error {}

interface RawEvent {
  title?: string;
  country?: string;
  date?: string;
  impact?: string;
  forecast?: string;
  previous?: string;
}

function isRelevant(event: RawEvent): event is Required<Pick<RawEvent, "title" | "country" | "date" | "impact">> &
  RawEvent {
  return (
    event.country === "USD" &&
    (event.impact === "High" || event.impact === "Medium") &&
    typeof event.title === "string" &&
    typeof event.date === "string" &&
    !Number.isNaN(Date.parse(event.date))
  );
}

export async function getUsEconomicEvents(): Promise<EconomicEvent[]> {
  const response = await fetch(CALENDAR_URL, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new CalendarError(
      `Wirtschaftskalender konnte nicht geladen werden (HTTP ${response.status}).`,
    );
  }

  const raw: unknown = await response.json();
  if (!Array.isArray(raw)) {
    throw new CalendarError("Unerwartetes Format des Wirtschaftskalenders.");
  }

  return (raw as RawEvent[])
    .filter(isRelevant)
    .map((event) => ({
      title: event.title,
      country: event.country,
      date: new Date(event.date).toISOString(),
      impact: event.impact as ImpactLevel,
      forecast: event.forecast || null,
      previous: event.previous || null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export type EconomicEventsResult = { events: EconomicEvent[] } | { error: string };

export async function getUsEconomicEventsResult(): Promise<EconomicEventsResult> {
  try {
    return { events: await getUsEconomicEvents() };
  } catch (error) {
    return {
      error:
        error instanceof CalendarError
          ? error.message
          : "Unerwarteter Fehler beim Abruf des Wirtschaftskalenders.",
    };
  }
}
