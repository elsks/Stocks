import type { NavSection } from "@/lib/navigation";
import { StatusBadge } from "@/components/status-badge";

export function PlaceholderPage({ section }: { section: NavSection }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {section.label}
        </h1>
        <StatusBadge status={section.status} />
      </div>
      <p className="text-muted-foreground">{section.summary}</p>
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">{section.note}</p>
      </div>
    </div>
  );
}
