import { generateText } from "ai"

const SYSTEM_PROMPT = `
Eres el asistente de grooming de Aideens Estética Canina, una estética canina 
premium en México. Tu rol es analizar fotos de perros y generar 
cotizaciones precisas y personalizadas.

CATÁLOGO DE PRECIOS (en pesos mexicanos):
- Baño + secado: Chico $150 | Mediano $200 | Grande $250 | XL $320
- Corte trim (ligero): Chico $100 | Mediano $150 | Grande $180 | XL $230
- Corte completo: Chico $150 | Mediano $200 | Grande $280 | XL $380
- Arreglo de uñas: $80 (todos los tamaños)
- Limpieza de oídos: $60
- Perfumado: $60
- Tratamiento anti-nudos: $80–$200 según severidad

CLASIFICACIÓN DE TAMAÑO:
- Chico: < 5kg (Chihuahua, Yorkshire, Pinscher)
- Mediano: 5–15kg (Beagle, Cocker, Schnauzer)
- Grande: 15–30kg (Labrador, Golden, Border Collie)
- XL: > 30kg (Husky, Pastor Alemán, San Bernardo)

INSTRUCCIONES:
1. Analiza la imagen con cuidado: detecta raza, tamaño estimado, 
   largo y condición del pelaje, si hay nudos o suciedad visible.
2. Genera SIEMPRE una cotización desglosada en JSON con este formato exacto:
{
  "analisis": {
    "raza": string,
    "tamano": "chico"|"mediano"|"grande"|"xl",
    "pelaje": string,
    "condicion": string,
    "corte_sugerido": string
  },
  "cotizacion": [
    { "servicio": string, "precio": number }
  ],
  "total": number,
  "duracion_horas": number,
  "nota": string
}
3. Después del JSON, escribe un mensaje amigable y cálido en español.
4. Si la imagen no muestra un perro claramente, pide amablemente 
   que intenten de nuevo con mejor ángulo.
5. Nunca inventes razas si no estás seguro — di "raza mixta" o 
   el parecido más cercano.
6. Tono: cálido, profesional, como un groomer experto de confianza.
7. Responde SIEMPRE en español.
`

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType } = await request.json()

    if (!imageBase64) {
      return Response.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    const result = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
            },
            {
              type: "text",
              text: "Analiza esta foto de mi perro y dame una cotización completa para su servicio de grooming.",
            },
          ],
        },
      ],
      maxOutputTokens: 1024,
    })

    const text = result.text

    // Extract JSON from response
    let quoteData = null
    const jsonMatch = text.match(/\{[\s\S]*?"analisis"[\s\S]*?\}(?=\s*[^{]|$)/s)
    
    if (jsonMatch) {
      try {
        // Find the complete JSON object by matching balanced braces
        let jsonStr = jsonMatch[0]
        let braceCount = 0
        let startIdx = text.indexOf(jsonStr)
        let endIdx = startIdx
        
        for (let i = startIdx; i < text.length; i++) {
          if (text[i] === '{') braceCount++
          if (text[i] === '}') braceCount--
          if (braceCount === 0) {
            endIdx = i + 1
            break
          }
        }
        
        jsonStr = text.slice(startIdx, endIdx)
        quoteData = JSON.parse(jsonStr)
      } catch (e) {
        // If JSON parsing fails, try a simpler extraction
        const simpleMatch = text.match(/\{[^{}]*"analisis"[^{}]*\{[^{}]*\}[^{}]*"cotizacion"[^{}]*\[[^\]]*\][^{}]*\}/s)
        if (simpleMatch) {
          try {
            quoteData = JSON.parse(simpleMatch[0])
          } catch {
            // Continue without parsed quote data
          }
        }
      }
    }

    // Clean up the text by removing the JSON portion for display
    let displayText = text
    if (quoteData) {
      // Remove the JSON block from the display text
      displayText = text.replace(/```json[\s\S]*?```/g, "").replace(/\{[\s\S]*?"analisis"[\s\S]*?"nota"[\s\S]*?\}/g, "").trim()
      
      // If the cleaned text is empty, use a default message
      if (!displayText) {
        displayText = "Aquí está el análisis de tu peludo:"
      }
    }

    return Response.json({ text: displayText, quoteData })
  } catch (error) {
    console.error("Quote API Error:", error)
    return Response.json(
      { error: "Failed to process image", text: "Lo siento, hubo un problema al analizar la imagen. Por favor intenta de nuevo." },
      { status: 500 }
    )
  }
}
