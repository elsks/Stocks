export type SectionStatus = "live" | "next" | "planned" | "waiting-for-input";

export interface NavSection {
  href: string;
  label: string;
  summary: string;
  status: SectionStatus;
  note: string;
}

export const navSections: NavSection[] = [
  {
    href: "/aktien",
    label: "Aktien",
    summary: "Watchlist und Kurse einzelner Unternehmen.",
    status: "live",
    note: "Deine echte Watchlist mit mehreren Aktien.",
  },
  {
    href: "/rohstoffe",
    label: "Gold & Rohstoffe",
    summary: "Kurse für Gold, Silber und weitere Rohstoffe.",
    status: "live",
    note: "Gold, Rohöl (WTI) und Silber.",
  },
  {
    href: "/unternehmen",
    label: "Unternehmensanalyse",
    summary: "Fundamentaldaten und Geschäftsmodell je Unternehmen.",
    status: "live",
    note: "Kennzahlen, Analysten-Kursziele und News für deine ganze Watchlist.",
  },
  {
    href: "/technische-analyse",
    label: "Technische Analyse",
    summary: "Historische Charts und technische Indikatoren.",
    status: "waiting-for-input",
    note: "Wartet auf deine eigenen Analyse-Kriterien, bevor hier etwas berechnet wird.",
  },
  {
    href: "/news",
    label: "News",
    summary: "Finanznachrichten mit Quellenangabe und Zusammenfassung.",
    status: "live",
    note: "US-Wirtschaftsdaten und geopolitische News sind live.",
  },
  {
    href: "/chancen-risiken",
    label: "Chancen & Risiken",
    summary: "Strukturierte Darstellung von Chancen, Risiken und Unsicherheiten.",
    status: "planned",
    note: "Baut auf Fundamental- und technischer Analyse auf, folgt später.",
  },
  {
    href: "/regeln",
    label: "Eigene Regeln",
    summary: "Deine eigenen Analyse-Kriterien, später von dir anpassbar.",
    status: "waiting-for-input",
    note: "Hier tragen wir deine Kriterien ein, sobald du sie festgelegt hast.",
  },
  {
    href: "/ki-research",
    label: "KI-Research",
    summary: "KI-gestützte Recherche und Fragen zu Märkten.",
    status: "planned",
    note: "Folgt, sobald die Anbindung an die Claude API steht.",
  },
];
