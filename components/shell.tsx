import Link from "next/link";
import { navSections } from "@/lib/navigation";

function NavList() {
  return (
    <nav className="flex flex-col gap-1">
      <Link
        href="/"
        className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent-soft"
      >
        Dashboard
      </Link>
      {navSections.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent-soft"
        >
          <span>{section.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface px-4 py-6 md:flex md:flex-col md:gap-6">
        <Link href="/" className="flex items-center gap-2 px-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
            FR
          </span>
          <span className="font-semibold tracking-tight">
            Finanzmarkt Research
          </span>
        </Link>
        <NavList />
      </aside>

      <details className="border-b border-border bg-surface md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
              FR
            </span>
            Finanzmarkt Research
          </span>
          <span className="text-sm text-muted-foreground">Menü</span>
        </summary>
        <div className="border-t border-border px-4 py-3">
          <NavList />
        </div>
      </details>

      <div className="flex-1">
        <header className="hidden items-center justify-end border-b border-border bg-surface px-8 py-4 md:flex">
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Entwicklungsstand &middot; Phase 2
          </span>
        </header>
        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
