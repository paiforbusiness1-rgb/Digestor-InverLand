import type { ChunkSource } from '@/shared/types/rag';

export interface NormalizedExtractedText {
  text: string;
  source: ChunkSource;
  charCount: number;
}

/**
 * Normaliza y valida texto ya extraído (OCR / analysis.extractedText).
 * No lee PDFs ni llama a Gemini — eso ocurre antes en /api/analyze.
 */
export function normalizeExtractedText(
  raw: string | undefined | null,
  preferredSource: ChunkSource = 'analysis_extracted'
): NormalizedExtractedText {
  const text = (raw ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!text) {
    throw new Error(
      'No hay texto extraíble para indexar. Ejecuta primero el análisis del expediente.'
    );
  }

  if (text.length < 40) {
    throw new Error(
      'El texto extraído es demasiado corto para generar un índice útil.'
    );
  }

  return {
    text,
    source: preferredSource,
    charCount: text.length,
  };
}
