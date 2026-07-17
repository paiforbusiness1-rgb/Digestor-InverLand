import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export interface PdfTextResult {
  text: string;
  pageCount: number;
  method: 'pdf_parse';
}

/**
 * Extrae capa de texto de un PDF (sin GPU). No hace OCR de páginas escaneadas.
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfTextResult> {
  // pdf-parse es CJS
  const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{
    text: string;
    numpages: number;
  }>;
  const result = await pdfParse(buffer);
  return {
    text: (result.text || '').trim(),
    pageCount: result.numpages || 0,
    method: 'pdf_parse',
  };
}
