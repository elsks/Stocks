import Anthropic from "@anthropic-ai/sdk";

export class AiError extends Error {}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AiError("Kein ANTHROPIC_API_KEY konfiguriert (siehe .env.local.example).");
  }
  if (!client) {
    client = new Anthropic({ apiKey });
  }
  return client;
}

const SYSTEM_PROMPT = `Du analysierst Finanzdaten für eine persönliche Research-Plattform.

Du bekommst ausschließlich Daten, die dir im Nutzer-Prompt mitgegeben werden
(Kennzahlen, News-Titel, Wirtschaftstermine). Erfinde niemals zusätzliche
Fakten, Zahlen oder Ereignisse.

Antworte ausschließlich mit einem JSON-Objekt in genau dieser Form, ohne
Markdown-Codeblock drumherum:

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

function parseAnalysis(raw: string): OpportunityAnalysis {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    throw new AiError("Claude-Antwort war kein gültiges JSON.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray((parsed as Record<string, unknown>).chancen) ||
    !Array.isArray((parsed as Record<string, unknown>).risiken) ||
    !Array.isArray((parsed as Record<string, unknown>).unsicherheiten)
  ) {
    throw new AiError("Claude-Antwort hatte nicht das erwartete Format.");
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
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Asset: ${assetLabel}\n\nDaten:\n${contextText}`,
      },
    ],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text",
  );
  if (!textBlock) {
    throw new AiError("Keine Textantwort von Claude erhalten.");
  }

  return parseAnalysis(textBlock.text);
}
