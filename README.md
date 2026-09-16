# Finanzmarkt-Research-Plattform

Webanwendung für Aktien-, Gold- und Rohstoffanalyse (langfristiges
Investieren, Swing-Trading, Day-Trading).

## Projektstruktur

```
/app                → Seiten (Dashboard, Aktienanalyse, News, ...)
/lib/data-sources    → Anbindung externer Datenanbieter
/lib/analysis        → Technische Indikatoren, Kennzahlen, eigene Regeln
/lib/ai              → Anbindung an die Claude API
/components          → Wiederverwendbare UI-Bausteine
```

Aktuell (Phase 1) enthält das Projekt nur ein leeres Grundgerüst ohne
echte Daten.

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org) (Version 20 oder neuer).

```bash
npm install
npm run dev
```

Danach im Browser [http://localhost:3000](http://localhost:3000) öffnen.

## API-Keys

Für spätere Phasen werden externe API-Keys benötigt (Kursdaten,
Fundamentaldaten, News, KI). Siehe `.env.local.example` für die Liste.
Zum Eintragen eigener Keys diese Datei zu `.env.local` kopieren –
`.env.local` wird nicht ins Repository eingecheckt.
