import type { ServerAppConfig } from '@/shared/config/schema';
import { extractDocumentText } from './documentTextService';
import { extractJsonObject, generateText } from './generationService';

const ANALYZE_SYSTEM = `Eres un experto legal, notario público y auditor de contratos inmobiliarios (Inverland Desarrollos).
Responde ÚNICAMENTE con un objeto JSON válido (sin markdown) con exactamente estas claves:
summary, legalRiskSummary, entities, metrics, dates, criticalDeadlines, keyClauses, alerts, extractedText.

entities: { buyerOrTenant, sellerOrLandlord, notary, propertyAddress, cadastralKey }
metrics: { surfaceArea, transactionAmount, currency, duration }
dates: { signingDate, expirationDate, registrationDate } (YYYY-MM-DD cuando sea posible)
criticalDeadlines: array de { title, date, description, priority: low|medium|high }
keyClauses: array de { title, summary, risk: low|medium|high, riskExplanation }
alerts: array de { type: critical|warning|info, message }
extractedText: transcripción completa del texto del documento en español.
Todo el contenido textual en español.`;

export interface AnalyzeInput {
  name: string;
  type?: string;
  size?: string;
  fileContent?: string;
  base64Data?: string;
  mimeType?: string;
}

/**
 * Análisis local: extracción PDF/OCR (Ollama CPU) + estructuración (Groq).
 */
export async function analyzeDocumentLocal(
  input: AnalyzeInput,
  config: ServerAppConfig
): Promise<{ analysis: Record<string, unknown>; ocrMethodUsed: string }> {
  const extracted = await extractDocumentText({
    name: input.name,
    mimeType: input.mimeType,
    fileContent: input.fileContent,
    base64Data: input.base64Data,
    config,
  });

  const userPrompt = `Nombre del archivo: ${input.name}
Tamaño: ${input.size || 'N/A'}
Tipo: ${input.type || input.mimeType || 'N/A'}
Método de extracción: ${extracted.methodLabel}

TEXTO DEL EXPEDIENTE:
${extracted.text.slice(0, 100_000)}

Devuelve el JSON de análisis completo. En extractedText incluye el texto del expediente (puedes condensar levemente si es enorme, pero conserva cláusulas clave).`;

  const raw = await generateText({
    config,
    system: ANALYZE_SYSTEM,
    user: userPrompt,
    temperature: 0.1,
  });

  const parsed = extractJsonObject(raw) as Record<string, unknown>;
  if (!parsed.extractedText) {
    parsed.extractedText = extracted.text;
  }
  parsed.ocrExtracted = true;
  parsed.ocrMethodUsed = extracted.methodLabel;

  return { analysis: parsed, ocrMethodUsed: extracted.methodLabel };
}

export async function compareDocumentsLocal(
  input: {
    docAName: string;
    docAContent: string;
    docBName: string;
    docBContent: string;
  },
  config: ServerAppConfig
): Promise<Record<string, unknown>> {
  const system = `Eres auditor legal de Inverland Desarrollos. Responde SOLO JSON válido con:
summary (string),
differences (array de { category, severity: low|medium|high, field, docAValue, docBValue, description }),
recommendations (array de strings).
Todo en español.`;

  const user = `DOCUMENTO A (${input.docAName}):
${String(input.docAContent).slice(0, 40_000)}

DOCUMENTO B (${input.docBName}):
${String(input.docBContent).slice(0, 40_000)}`;

  const raw = await generateText({ config, system, user, temperature: 0.1 });
  return extractJsonObject(raw) as Record<string, unknown>;
}
