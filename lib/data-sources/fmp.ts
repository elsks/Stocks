const BASE_URL = "https://financialmodelingprep.com/stable";
const REVALIDATE_SECONDS = 60 * 60;

export class FundamentalsError extends Error {}

function apiKey(): string {
  const key = process.env.FUNDAMENTALS_API_KEY;
  if (!key) {
    throw new FundamentalsError(
      "Kein FUNDAMENTALS_API_KEY konfiguriert (siehe .env.local.example).",
    );
  }
  return key;
}

async function fetchFmp(path: string, symbol: string): Promise<Record<string, unknown>> {
  const url = new URL(`${BASE_URL}/${path}`);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("apikey", apiKey());

  const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  const data = await response.json();

  if (!response.ok) {
    throw new FundamentalsError(
      typeof data?.["Error Message"] === "string"
        ? data["Error Message"]
        : `Financial Modeling Prep Fehler (HTTP ${response.status})`,
    );
  }

  const first = Array.isArray(data) ? data[0] : data;
  if (!first || typeof first !== "object") {
    throw new FundamentalsError(
      `Keine Daten von Financial Modeling Prep für "${symbol}".`,
    );
  }
  return first as Record<string, unknown>;
}

function pickNumber(
  source: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
}

function pickString(
  source: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }
  return null;
}

export interface CompanyProfile {
  name: string;
  sector: string | null;
  industry: string | null;
  description: string | null;
  marketCap: number | null;
  currency: string;
}

export interface FundamentalMetrics {
  peRatio: number | null;
  priceToSales: number | null;
  priceToFreeCashFlow: number | null;
  evToEbitda: number | null;
  priceToBook: number | null;
  dividendYieldPercent: number | null;
  roicPercent: number | null;
  roePercent: number | null;
  fcfMarginPercent: number | null;
  netMarginPercent: number | null;
  grossMarginPercent: number | null;
  equityRatioPercent: number | null;
  debtToEquity: number | null;
  netDebtToEbitda: number | null;
  interestCoverage: number | null;
}

export interface CompanyFundamentals {
  symbol: string;
  profile: CompanyProfile;
  metrics: FundamentalMetrics;
}

function toPercent(ratio: number | null): number | null {
  return ratio === null ? null : ratio * 100;
}

export async function getCompanyFundamentals(
  symbol: string,
): Promise<CompanyFundamentals> {
  const [profileRaw, ratiosRaw, keyMetricsRaw, balanceSheetRaw] = await Promise.all([
    fetchFmp("profile", symbol),
    fetchFmp("ratios-ttm", symbol),
    fetchFmp("key-metrics-ttm", symbol),
    fetchFmp("balance-sheet-statement", symbol),
  ]);

  const totalEquity = pickNumber(balanceSheetRaw, [
    "totalStockholdersEquity",
    "totalEquity",
  ]);
  const totalAssets = pickNumber(balanceSheetRaw, ["totalAssets"]);
  const equityRatioPercent =
    totalEquity !== null && totalAssets ? (totalEquity / totalAssets) * 100 : null;

  const profile: CompanyProfile = {
    name: pickString(profileRaw, ["companyName", "name"]) ?? symbol,
    sector: pickString(profileRaw, ["sector"]),
    industry: pickString(profileRaw, ["industry"]),
    description: pickString(profileRaw, ["description"]),
    marketCap: pickNumber(profileRaw, ["marketCap", "mktCap"]),
    currency: pickString(profileRaw, ["currency"]) ?? "USD",
  };

  const metrics: FundamentalMetrics = {
    peRatio: pickNumber(ratiosRaw, [
      "priceToEarningsRatioTTM",
      "peRatioTTM",
      "priceEarningsRatioTTM",
    ]),
    priceToSales: pickNumber(ratiosRaw, [
      "priceToSalesRatioTTM",
      "priceSalesRatioTTM",
    ]),
    priceToFreeCashFlow: pickNumber(ratiosRaw, [
      "priceToFreeCashFlowRatioTTM",
      "priceToFreeCashFlowsRatioTTM",
      "pfcfRatioTTM",
    ]),
    evToEbitda: pickNumber(keyMetricsRaw, [
      "evToEBITDATTM",
      "enterpriseValueOverEBITDATTM",
    ]),
    priceToBook: pickNumber(ratiosRaw, ["priceToBookRatioTTM", "pbRatioTTM"]),
    dividendYieldPercent: toPercent(
      pickNumber(ratiosRaw, ["dividendYieldTTM", "dividendYielPercentageTTM"]),
    ),
    roicPercent: toPercent(
      pickNumber(keyMetricsRaw, ["returnOnInvestedCapitalTTM", "roicTTM"]),
    ),
    roePercent: toPercent(
      pickNumber(ratiosRaw, ["returnOnEquityTTM", "roeTTM"]),
    ),
    fcfMarginPercent: toPercent(
      pickNumber(ratiosRaw, ["freeCashFlowMarginTTM"]) ??
        pickNumber(keyMetricsRaw, ["freeCashFlowMarginTTM"]),
    ),
    netMarginPercent: toPercent(
      pickNumber(ratiosRaw, ["netProfitMarginTTM"]),
    ),
    grossMarginPercent: toPercent(
      pickNumber(ratiosRaw, ["grossProfitMarginTTM"]),
    ),
    equityRatioPercent,
    debtToEquity: pickNumber(ratiosRaw, [
      "debtToEquityRatioTTM",
      "debtEquityRatioTTM",
    ]),
    netDebtToEbitda: pickNumber(keyMetricsRaw, [
      "netDebtToEBITDATTM",
      "netDebtToEbitdaTTM",
    ]),
    interestCoverage: pickNumber(ratiosRaw, ["interestCoverageTTM"]),
  };

  return { symbol, profile, metrics };
}

export type FundamentalsResult =
  | { fundamentals: CompanyFundamentals }
  | { error: string };

export async function getCompanyFundamentalsResult(
  symbol: string,
): Promise<FundamentalsResult> {
  try {
    return { fundamentals: await getCompanyFundamentals(symbol) };
  } catch (error) {
    return {
      error:
        error instanceof FundamentalsError
          ? error.message
          : "Unerwarteter Fehler beim Abruf der Fundamentaldaten.",
    };
  }
}
