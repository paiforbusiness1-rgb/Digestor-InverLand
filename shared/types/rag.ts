/**
 * Contratos RAG / índice local — compartidos entre Express (backend) y Vite (frontend).
 * Fase 0: solo tipos. Sin lógica de negocio.
 */

export type DocumentCategory =
  | 'escritura'
  | 'contrato'
  | 'plano'
  | 'factura'
  | 'otro';

/**
 * Estados U-First del pipeline de indexación.
 * Flujo: not_indexed → extracting → chunking → embedding → indexed_local | indexing_failed
 * El chat in-context actual sigue activo mientras el status sea `not_indexed` o durante el proceso.
 */
export type IndexStatus =
  | 'not_indexed'
  | 'extracting'
  | 'chunking'
  | 'embedding'
  | 'indexed_local'
  | 'indexing_failed'
  | 'sync_pending'
  | 'synced_cloud';

export type ChunkSource = 'ocr' | 'native_text' | 'analysis_extracted';

export interface ChunkMetadata {
  pageStart?: number;
  pageEnd?: number;
  source?: ChunkSource;
  headingHint?: string;
}

/**
 * Documento indexado para RAG (capa de índice, no el PDF binario).
 * `sourceDocumentId` enlaza con el id del expediente en la UI / historial.
 */
export interface DocumentRecord {
  id: string;
  sourceDocumentId: string;
  name: string;
  category: DocumentCategory;
  mimeType?: string;
  indexStatus: IndexStatus;
  chunkCount: number;
  embeddingModel: string;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  /** Reservado Fase 4 — Firestore */
  firebaseDocId?: string;
}

/**
 * Fragmento de texto + embedding.
 * El embedding se genera SIEMPRE en el backend; el cliente nunca ve la API key.
 *
 * Contrato de ciclo de vida de `embedding`:
 * 1. Tras chunking → insertar en SQLite con `embedding: null`
 * 2. Tras Gemini embedContent → actualizar el vector (number[])
 * 3. Si falla el embedding → el chunk permanece en `null` y el DocumentRecord
 *    pasa a `indexStatus: 'indexing_failed'` (U-First: error + reintentar)
 */
export interface ChunkRecord {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  /** null = pendiente o fallido; number[] = listo para retrieval */
  embedding: number[] | null;
  tokenEstimate?: number;
  metadata: ChunkMetadata;
  createdAt: string;
}

/** Payload mínimo que el frontend envía al backend para iniciar ingesta (Fase 1+). */
export interface IngestRequest {
  sourceDocumentId: string;
  name: string;
  category: DocumentCategory;
  mimeType?: string;
  /** Texto ya extraído (p. ej. analysis.extractedText) o cuerpo a indexar */
  extractedText: string;
}

/** Respuesta de progreso / resultado de ingesta (Fase 1+). */
export interface IngestProgressResponse {
  document: DocumentRecord;
  message: string;
}
