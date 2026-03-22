import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { parseQuoteFromResponse } from "@/lib/quote-parser";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const SYSTEM_PROMPT = `Eres el groomer AI de Aideens Estética Canina, una estética canina premium.
Tu objetivo es analizar fotos de perros y generar cotizaciones precisas.

CATÁLOGO DE PRECIOS (MXN):
| Servicio | Chico (<10kg) | Mediano (10-20kg) | Grande (20-35kg) | XL (>35kg) |
|---|---|---|---|---|
| Baño profundo | $180 | $220 | $280 | $350 |
| Corte de raza | $200 | $250 | $320 | $400 |
| Corte trim/natural | $150 | $180 | $220 | $280 |
| Arreglo de uñas | $60 | $60 | $80 | $80 |
| Limpieza de oídos | $50 | $50 | $60 | $60 |
| Deslanado | $100 | $150 | $200 | $280 |
| Spa premium (baño + masaje + aromaterapia) | $350 | $420 | $500 | $600 |

EXTRAS:
| Extra | Precio |
|---|---|
| Desenredo leve (algunos nudos) | +$80 |
| Desenredo severo (bastantes nudos) | +$150 |

REGLAS:
- Responde SIEMPRE en español, tono cálido y experto.
- Cuando recibas una imagen, devuelve primero el JSON de cotización, luego el mensaje al usuario. El JSON va entre \`\`\`json y \`\`\`.
- El JSON debe tener esta estructura exacta:
{
  "analisis": {
    "raza": "string",
    "tamano": "chico" | "mediano" | "grande" | "xl",
    "peso_estimado": "string con kg",
    "pelaje": "descripción del tipo de pelaje",
    "condicion": "estado actual del pelaje",
    "corte_sugerido": "nombre del corte recomendado"
  },
  "cotizacion": [
    { "servicio": "nombre", "precio": número }
  ],
  "total": número,
  "duracion_horas": número
}
- Si la imagen no muestra un perro, pide intentar de nuevo amablemente.
- Si la raza no es clara, di "Raza mixta" con el parecido más cercano.
- Nunca inventes precios fuera del catálogo.
- Máximo 2 preguntas de seguimiento por sesión.
- En la cotización final, ajusta por nudos:
    sin nudos: precio base
    algunos nudos: +$80
    bastantes nudos: +$150
- No incluyas el JSON en las respuestas de seguimiento (sin imagen), solo texto conversacional.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  imageBase64?: string;
  mimeType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { messages, imageBase64, mimeType } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Se requiere el historial de mensajes" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    // Build the messages array for OpenAI
    const openaiMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    for (let idx = 0; idx < messages.length; idx++) {
      const msg = messages[idx];

      if (idx === 0 && msg.role === "user" && imageBase64 && mimeType) {
        // First user message with image — use vision format
        const dataUrl = `data:${mimeType};base64,${imageBase64}`;
        openaiMessages.push({
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
            {
              type: "text",
              text: msg.content || "Analiza esta foto de mi perro y dame una cotización.",
            },
          ],
        });
      } else {
        openaiMessages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await openai.chat.completions.create(
        {
          model: "gpt-4o",
          max_tokens: 1024,
          messages: openaiMessages,
        },
        { signal: controller.signal }
      );

      const rawText = response.choices[0]?.message?.content ?? "";
      const { cleanText, quoteData } = parseQuoteFromResponse(rawText);

      return NextResponse.json({
        text: cleanText,
        quoteData: quoteData ?? null,
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { text: "La solicitud tardó demasiado. ¿Intentamos de nuevo?", quoteData: null },
        { status: 200 }
      );
    }
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      (error as { status: number }).status === 429
    ) {
      return NextResponse.json(
        { text: "Estamos muy ocupados en este momento. Intenta en un momento.", quoteData: null },
        { status: 200 }
      );
    }
    console.error("Quote API error:", error);
    return NextResponse.json(
      { text: "Algo salió mal, ¿intentamos de nuevo?", quoteData: null },
      { status: 200 }
    );
  }
}
