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
    note: "Zeigt aktuell einen Beispielkurs &ndash; die echte Watchlist folgt später.",
  },
  {
    href: "/rohstoffe",
    label: "Gold & Rohstoffe",
    summary: "Kurse für Gold, Silber und weitere Rohstoffe.",
    status: "live",
    note: "Zeigt aktuell den Goldpreis &ndash; weitere Rohstoffe folgen später.",
  },
  {
    href: "/unternehmen",
    label: "Unternehmensanalyse",
    summary: "Fundamentaldaten und Geschäftsmodell je Unternehmen.",
    status: "planned",
    note: "Folgt, sobald Fundamentaldaten angebunden sind (Phase 4).",
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
    note: "US-Wirtschaftsdaten sind live, geopolitische News folgen als Nächstes.",
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
