const SEARCH_URL = "https://gnews.io/api/v4/search";
const REVALIDATE_SECONDS = 60 * 60;

const QUERY =
  '(geopolitics OR sanctions OR tariffs OR "trade war" OR conflict OR election OR "central bank")';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  sourceName: string;
  publishedAt: string;
}

export class NewsError extends Error {}

interface RawArticle {
  title?: string;
  description?: string;
  url?: string;
  publishedAt?: string;
  source?: { name?: string };
}

function isUsable(article: RawArticle): article is Required<Pick<RawArticle, "title" | "url">> & RawArticle {
  return typeof article.title === "string" && typeof article.url === "string";
}

export async function getGeopoliticalNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new NewsError("Kein NEWS_API_KEY konfiguriert (siehe .env.local.example).");
  }

  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", QUERY);
  url.searchParams.set("lang", "en");
  url.searchParams.set("max", "10");
  url.searchParams.set("sortby", "publishedAt");
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  const data = await response.json();

  if (!response.ok) {
    throw new NewsError(
      data.errors?.[0] ?? `GNews Fehler (HTTP ${response.status})`,
    );
  }

  const articles: unknown = data.articles;
  if (!Array.isArray(articles)) {
    throw new NewsError("Unerwartetes Format der GNews-Antwort.");
  }

  return (articles as RawArticle[]).filter(isUsable).map((article) => ({
    title: article.title,
    description: article.description ?? "",
    url: article.url,
    sourceName: article.source?.name ?? "Unbekannte Quelle",
    publishedAt: article.publishedAt ?? new Date().toISOString(),
  }));
}

export type NewsResult = { articles: NewsArticle[] } | { error: string };

export async function getGeopoliticalNewsResult(): Promise<NewsResult> {
  try {
    return { articles: await getGeopoliticalNews() };
  } catch (error) {
    return {
      error:
        error instanceof NewsError
          ? error.message
          : "Unerwarteter Fehler beim Abruf der News.",
    };
  }
}
