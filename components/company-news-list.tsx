import type { CompanyNewsArticle } from "@/lib/data-sources/fmp";

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("de-DE", { dateStyle: "medium" });
}

export function CompanyNewsList({ articles }: { articles: CompanyNewsArticle[] }) {
  if (articles.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-8 text-center text-sm text-muted-foreground">
        Keine aktuellen Artikel gefunden.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {articles.map((article) => (
        <a
          key={article.url}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent"
        >
          <span className="text-sm font-medium">{article.title}</span>
          <span className="text-xs text-muted-foreground">
            {article.site}
            {article.publishedDate ? ` · ${formatDate(article.publishedDate)}` : ""}
          </span>
        </a>
      ))}
    </div>
  );
}
