import type { NewsArticle } from "@/lib/data-sources/geopolitical-news";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function NewsArticleList({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-8 text-center text-sm text-muted-foreground">
        Aktuell keine passenden Artikel gefunden.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {articles.map((article) => (
        <a
          key={article.url}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent"
        >
          <span className="font-medium">{article.title}</span>
          {article.description && (
            <span className="text-sm text-muted-foreground">
              {article.description}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {article.sourceName} &middot; {formatDate(article.publishedAt)}
          </span>
        </a>
      ))}
    </div>
  );
}
