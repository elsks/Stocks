const BASE_URL = "https://api.twelvedata.com/quote";

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

  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new MarketDataError(
      data.message ?? `Twelve Data Fehler (HTTP ${response.status})`,
    );
  }

  return {
    symbol: data.symbol,
    name: data.name,
    price: Number(data.close),
    change: Number(data.change),
    changePercent: Number(data.percent_change),
    currency: data.currency,
    exchange: data.exchange,
    asOf: new Date(Number(data.timestamp) * 1000).toISOString(),
    isMarketOpen: data.is_market_open === true,
  };
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
