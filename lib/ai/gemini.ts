import { GoogleGenAI } from "@google/genai";

export class AiError extends Error {}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiError("Kein GEMINI_API_KEY konfiguriert (siehe .env.local.example).");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const SYSTEM_PROMPT = `Du analysierst Finanzdaten für eine persönliche Research-Plattform.

Du bekommst ausschließlich Daten, die dir weiter unten mitgegeben werden
(Kennzahlen, News-Titel, Wirtschaftstermine). Erfinde niemals zusätzliche
Fakten, Zahlen oder Ereignisse.

Antworte ausschließlich mit einem JSON-Objekt in genau dieser Form, ohne
Markdown-Codeblock drumherum, ohne einleitenden oder abschließenden Text:

{
  "chancen": ["Stichpunkt mit Bezug auf eine konkrete gelieferte Angabe", ...],
  "risiken": ["...", ...],
  "unsicherheiten": ["...", ...]
}

Regeln:
- 2 bis 4 Stichpunkte pro Kategorie, auf Deutsch, je ein Satz.
- Jeder Stichpunkt muss sich auf eine der gelieferten Angaben beziehen (Kennzahl, News-Titel oder Termin).
- Gib NIEMALS eine Kauf-, Verkaufs- oder Halte-Empfehlung ab.
- Gib NIEMALS eine Note, einen Score oder ein eigenes Kursziel an.
- "unsicherheiten" beschreibt, was in den Daten offen oder nicht eindeutig ist - nicht Risiken doppeln.
- Wenn kaum Daten vorhanden sind, sag das ehrlich statt zu spekulieren.`;

export interface OpportunityAnalysis {
  chancen: string[];
  risiken: string[];
  unsicherheiten: string[];
  generatedAt: string;
}

function stripCodeFence(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

function parseAnalysis(raw: string): OpportunityAnalysis {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(raw));
  } catch {
    throw new AiError("Gemini-Antwort war kein gültiges JSON.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray((parsed as Record<string, unknown>).chancen) ||
    !Array.isArray((parsed as Record<string, unknown>).risiken) ||
    !Array.isArray((parsed as Record<string, unknown>).unsicherheiten)
  ) {
    throw new AiError("Gemini-Antwort hatte nicht das erwartete Format.");
  }

  const asStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

  const record = parsed as Record<string, unknown>;
  return {
    chancen: asStringArray(record.chancen),
    risiken: asStringArray(record.risiken),
    unsicherheiten: asStringArray(record.unsicherheiten),
    generatedAt: new Date().toISOString(),
  };
}

export async function generateOpportunityAnalysis(
  assetLabel: string,
  contextText: string,
): Promise<OpportunityAnalysis> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: `${SYSTEM_PROMPT}\n\nAsset: ${assetLabel}\n\nDaten:\n${contextText}`,
  });

  const text = response.text;
  if (!text) {
    throw new AiError("Keine Textantwort von Gemini erhalten.");
  }

  return parseAnalysis(text);
}
