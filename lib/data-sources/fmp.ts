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

async function fetchFmp(
  path: string,
  symbol: string,
  extraParams: Record<string, string> = {},
): Promise<Record<string, unknown>> {
  const url = new URL(`${BASE_URL}/${path}`);
  url.searchParams.set("symbol", symbol);
  for (const [key, value] of Object.entries(extraParams)) {
    url.searchParams.set(key, value);
  }
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
  const [profileRaw, ratiosRaw, keyMetricsRaw, balanceSheetRaw, incomeStatementRaw] =
    await Promise.all([
      fetchFmp("profile", symbol),
      fetchFmp("ratios-ttm", symbol),
      fetchFmp("key-metrics-ttm", symbol),
      fetchFmp("balance-sheet-statement", symbol, { period: "annual", limit: "1" }),
      fetchFmp("income-statement", symbol, { period: "annual", limit: "1" }),
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

  const combined = { ...ratiosRaw, ...keyMetricsRaw };

  const freeCashFlowPerShare = pickNumber(combined, [
    "freeCashFlowPerShareTTM",
    "freeCashFlowPerShare",
  ]);
  const revenuePerShare = pickNumber(combined, [
    "revenuePerShareTTM",
    "revenuePerShare",
  ]);
  const computedFcfMargin =
    freeCashFlowPerShare !== null && revenuePerShare
      ? freeCashFlowPerShare / revenuePerShare
      : null;

  const operatingIncome = pickNumber(incomeStatementRaw, [
    "operatingIncome",
    "ebit",
  ]);
  const interestExpense = pickNumber(incomeStatementRaw, [
    "interestExpense",
    "totalInterestExpense",
    "netInterestIncome",
  ]);
  const computedInterestCoverage =
    operatingIncome !== null && interestExpense
      ? operatingIncome / Math.abs(interestExpense)
      : null;

  const metrics: FundamentalMetrics = {
    peRatio: pickNumber(combined, [
      "priceToEarningsRatioTTM",
      "peRatioTTM",
      "priceEarningsRatioTTM",
    ]),
    priceToSales: pickNumber(combined, [
      "priceToSalesRatioTTM",
      "priceSalesRatioTTM",
    ]),
    priceToFreeCashFlow: pickNumber(combined, [
      "priceToFreeCashFlowRatioTTM",
      "priceToFreeCashFlowsRatioTTM",
      "pfcfRatioTTM",
    ]),
    evToEbitda: pickNumber(combined, [
      "evToEBITDATTM",
      "enterpriseValueOverEBITDATTM",
      "evToOperatingCashFlowTTM",
    ]),
    priceToBook: pickNumber(combined, ["priceToBookRatioTTM", "pbRatioTTM"]),
    dividendYieldPercent: toPercent(
      pickNumber(combined, ["dividendYieldTTM", "dividendYielPercentageTTM"]),
    ),
    roicPercent: toPercent(
      pickNumber(combined, ["returnOnInvestedCapitalTTM", "roicTTM"]),
    ),
    roePercent: toPercent(
      pickNumber(combined, [
        "returnOnEquityTTM",
        "roeTTM",
        "returnOnEquity",
      ]),
    ),
    fcfMarginPercent: toPercent(
      pickNumber(combined, [
        "freeCashFlowMarginTTM",
        "freeCashFlowToRevenueTTM",
        "fcfMarginTTM",
      ]) ?? computedFcfMargin,
    ),
    netMarginPercent: toPercent(
      pickNumber(combined, ["netProfitMarginTTM"]),
    ),
    grossMarginPercent: toPercent(
      pickNumber(combined, ["grossProfitMarginTTM"]),
    ),
    equityRatioPercent,
    debtToEquity: pickNumber(combined, [
      "debtToEquityRatioTTM",
      "debtEquityRatioTTM",
    ]),
    netDebtToEbitda: pickNumber(combined, [
      "netDebtToEBITDATTM",
      "netDebtToEbitdaTTM",
    ]),
    interestCoverage: computedInterestCoverage,
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
