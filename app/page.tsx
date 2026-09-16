import Link from "next/link";
import { navSections } from "@/lib/navigation";
import { StatusBadge } from "@/components/status-badge";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hallo Emil
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Willkommen bei deiner Finanzmarkt-Research-Plattform. Unten siehst
          du alle geplanten Bereiche und ihren aktuellen Stand &ndash; echte
          Daten kommen Schritt für Schritt dazu.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {navSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-medium">{section.label}</h2>
              <StatusBadge status={section.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {section.summary}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
