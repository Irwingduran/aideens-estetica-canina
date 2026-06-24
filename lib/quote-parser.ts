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

export interface ProductSuggestion {
  nombre: string;
  descripcion: string;
  precio: number;
  razon: string;
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
    if (parsed.analisis && parsed.cotizacion && typeof parsed.total === "number") {
      return { cleanText, quoteData: parsed };
    }
    return { cleanText, quoteData: null };
  } catch {
    return { cleanText: text.trim(), quoteData: null };
  }
}

/**
 * Extracts product suggestions from the AI response.
 * Looks for ```json_productsuggestions ... ``` blocks.
 */
export function parseProductSuggestions(text: string): ProductSuggestion[] | null {
  const regex = /```json_productsuggestions\s*([\s\S]*?)```/;
  const match = text.match(regex);

  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1].trim());
    if (Array.isArray(parsed)) {
      return parsed as ProductSuggestion[];
    }
    if (parsed.productos && Array.isArray(parsed.productos)) {
      return parsed.productos as ProductSuggestion[];
    }
    return null;
  } catch {
    return null;
  }
}
