import type { SectionStatus } from "@/lib/navigation";

const labels: Record<SectionStatus, string> = {
  live: "Live-Daten",
  next: "Als Nächstes",
  planned: "Geplant",
  "waiting-for-input": "Wartet auf dich",
};

const styles: Record<SectionStatus, string> = {
  live: "bg-accent text-accent-foreground",
  next: "bg-accent-soft text-accent",
  planned: "bg-background text-muted-foreground border border-border",
  "waiting-for-input":
    "bg-background text-muted-foreground border border-dashed border-border",
};

export function StatusBadge({ status }: { status: SectionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
