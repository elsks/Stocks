const BASE_URL = "https://api.twelvedata.com/quote";
// Der kostenlose Twelve-Data-Tarif erlaubt nur 8 Anfragen/Minute; bei 11
// Watchlist-Symbolen reicht ein einziger Seitenaufruf, um das Limit
// auszuschoepfen. 5 Minuten Cache vermeiden das und passen zum
// langfristigen Anlagehorizont dieser Plattform.
const REVALIDATE_SECONDS = 5 * 60;

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  exchange: string;
  asOf: string;
  isMarketOpen: boolean;
}

export class MarketDataError extends Error {}

function parseQuote(data: Record<string, unknown>, fallbackSymbol: string): Quote {
  const price = Number(data.close);
  if (!Number.isFinite(price)) {
    throw new MarketDataError(
      "Twelve Data hat keinen gültigen Kurs für dieses Symbol geliefert.",
    );
  }

  const currency =
    typeof data.currency === "string" && /^[A-Z]{3}$/.test(data.currency)
      ? data.currency
      : "USD";

  const timestampMs = Number(data.timestamp) * 1000;
  const asOf = Number.isFinite(timestampMs)
    ? new Date(timestampMs).toISOString()
    : new Date().toISOString();

  return {
    symbol: typeof data.symbol === "string" ? data.symbol : fallbackSymbol,
    name:
      typeof data.name === "string"
        ? data.name
        : typeof data.symbol === "string"
          ? data.symbol
          : fallbackSymbol,
    price,
    change: Number(data.change) || 0,
    changePercent: Number(data.percent_change) || 0,
    currency,
    exchange: typeof data.exchange === "string" ? data.exchange : "-",
    asOf,
    isMarketOpen: data.is_market_open === true,
  };
}

export async function getQuote(symbol: string): Promise<Quote> {
  const apiKey = process.env.MARKET_DATA_API_KEY;
  if (!apiKey) {
    throw new MarketDataError(
      "Kein MARKET_DATA_API_KEY konfiguriert (siehe .env.local.example).",
    );
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new MarketDataError(
      data.message ?? `Twelve Data Fehler (HTTP ${response.status})`,
    );
  }

  return parseQuote(data, symbol);
}

export type QuoteResult = { quote: Quote } | { error: string };

export async function getQuoteResult(symbol: string): Promise<QuoteResult> {
  try {
    return { quote: await getQuote(symbol) };
  } catch (error) {
    return {
      error:
        error instanceof MarketDataError
          ? error.message
          : "Unerwarteter Fehler beim Abruf der Kursdaten.",
    };
  }
}

export interface WatchlistEntry {
  symbol: string;
  result: QuoteResult;
}

export async function getQuotesResult(symbols: string[]): Promise<WatchlistEntry[]> {
  const apiKey = process.env.MARKET_DATA_API_KEY;
  if (!apiKey) {
    const error = { error: "Kein MARKET_DATA_API_KEY konfiguriert (siehe .env.local.example)." };
    return symbols.map((symbol) => ({ symbol, result: error }));
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("symbol", symbols.join(","));
  url.searchParams.set("apikey", apiKey);

  let data: Record<string, unknown>;
  try {
    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    data = await response.json();
    if (!response.ok) {
      throw new MarketDataError(`Twelve Data Fehler (HTTP ${response.status})`);
    }
  } catch (error) {
    const message =
      error instanceof MarketDataError
        ? error.message
        : "Unerwarteter Fehler beim Abruf der Kursdaten.";
    return symbols.map((symbol) => ({ symbol, result: { error: message } }));
  }

  // Bei mehreren Symbolen liefert Twelve Data ein Objekt je Symbol als Key,
  // bei einem einzelnen Symbol das Quote-Objekt direkt.
  const isBatchShape = symbols.length > 1 && typeof data[symbols[0]] === "object";

  return symbols.map((symbol) => {
    const entry = isBatchShape
      ? (data[symbol] as Record<string, unknown> | undefined)
      : data;

    if (!entry || typeof entry !== "object") {
      return { symbol, result: { error: `Keine Daten für "${symbol}".` } };
    }
    if (entry.status === "error") {
      return {
        symbol,
        result: {
          error:
            typeof entry.message === "string"
              ? entry.message
              : `Twelve Data konnte "${symbol}" nicht laden.`,
        },
      };
    }
    try {
      return { symbol, result: { quote: parseQuote(entry, symbol) } };
    } catch (error) {
      return {
        symbol,
        result: {
          error:
            error instanceof MarketDataError
              ? error.message
              : `Unerwarteter Fehler bei "${symbol}".`,
        },
      };
    }
  });
}
