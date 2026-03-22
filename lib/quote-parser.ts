export interface QuoteData {
  analisis: {
    raza: string;
    tamano: "chico" | "mediano" | "grande" | "xl";
    peso_estimado: string;
    pelaje: string;
    condicion: string;
    corte_sugerido: string;
  };
  cotizacion: {
    servicio: string;
    precio: number;
  }[];
  total: number;
  duracion_horas: number;
}

/**
 * Extracts JSON quote data from Claude's response text.
 * Expects the JSON to be wrapped in ```json ... ``` blocks.
 */
export function parseQuoteFromResponse(text: string): {
  cleanText: string;
  quoteData: QuoteData | null;
} {
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/;
  const match = text.match(jsonBlockRegex);

  if (!match) {
    return { cleanText: text.trim(), quoteData: null };
  }

  const cleanText = text.replace(jsonBlockRegex, "").trim();

  try {
    const parsed = JSON.parse(match[1].trim()) as QuoteData;
    // Basic validation
    if (parsed.analisis && parsed.cotizacion && typeof parsed.total === "number") {
      return { cleanText, quoteData: parsed };
    }
    return { cleanText, quoteData: null };
  } catch {
    return { cleanText: text.trim(), quoteData: null };
  }
}
