import type { ServerAppConfig } from '@/shared/config/schema';
import type { ChunkSource } from '@/shared/types/rag';
import { extractPdfText } from './pdfTextService';
import { ollamaOcrImage } from './ollamaClient';

export interface DocumentTextExtraction {
  text: string;
  source: ChunkSource;
  methodLabel: string;
}

function isImageMime(mimeType?: string): boolean {
  return Boolean(mimeType?.startsWith('image/'));
}

function isPdfMime(mimeType?: string, name?: string): boolean {
  return (
    mimeType === 'application/pdf' ||
    Boolean(name?.toLowerCase().endsWith('.pdf'))
  );
}

/**
 * Obtiene texto de un expediente: capa PDF → OCR Ollama (CPU) si hace falta.
 */
export async function extractDocumentText(input: {
  name?: string;
  mimeType?: string;
  fileContent?: string;
  base64Data?: string;
  config: ServerAppConfig;
}): Promise<DocumentTextExtraction> {
  const { name, mimeType, fileContent, base64Data, config } = input;

  if (fileContent && fileContent.trim().length >= config.minExtractedChars) {
    return {
      text: fileContent.trim(),
      source: 'native_text',
      methodLabel: 'Parser de texto nativo',
    };
  }

  if (base64Data && isPdfMime(mimeType, name)) {
    const buffer = Buffer.from(base64Data, 'base64');
    const pdf = await extractPdfText(buffer);
    if (pdf.text.length >= config.minExtractedChars) {
      return {
        text: pdf.text,
        source: 'native_text',
        methodLabel: `PDF texto nativo (${pdf.pageCount} págs.)`,
      };
    }
  }

  if (base64Data && isImageMime(mimeType)) {
    if (config.ocrProvider !== 'ollama') {
      throw new Error('OCR de imagen requiere OCR_PROVIDER=ollama (glm-ocr).');
    }
    const text = await ollamaOcrImage(base64Data, config);
    return {
      text,
      source: 'ocr',
      methodLabel: `Ollama OCR CPU (${config.ocrModel})`,
    };
  }

  // PDF escaneado / poco texto: intentar OCR tratando el PDF como no soportado
  // sin rasterizar (evita canvas/GPU). Pedimos al usuario texto nativo o imagen.
  if (base64Data && isPdfMime(mimeType, name)) {
    throw new Error(
      'El PDF parece escaneado (poca capa de texto). Para OCR local sin GPU, exporta páginas a PNG/JPG e intenta de nuevo, o usa un PDF con texto seleccionable. Motor OCR: glm-ocr vía Ollama (CPU).'
    );
  }

  if (fileContent?.trim()) {
    return {
      text: fileContent.trim(),
      source: 'native_text',
      methodLabel: 'Parser de texto nativo (corto)',
    };
  }

  throw new Error('No se pudo extraer texto del documento.');
}
