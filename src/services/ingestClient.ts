import type { DocumentCategory, IngestProgressResponse, IndexStatus } from '@/shared/types/rag';

export const INDEX_STATUS_LABELS: Record<IndexStatus, string> = {
  not_indexed: 'Sin indexar',
  extracting: 'Extrayendo texto…',
  chunking: 'Fragmentando…',
  embedding: 'Generando embeddings…',
  indexed_local: 'Indexado en local',
  indexing_failed: 'Error al indexar',
  sync_pending: 'Sincronizando…',
  synced_cloud: 'Sincronizado en la nube',
};

/** Cliente fino — solo HTTP. Sin lógica de chunking/embeddings. */
export async function requestLocalIngest(payload: {
  sourceDocumentId: string;
  name: string;
  category: DocumentCategory;
  mimeType?: string;
  extractedText: string;
}): Promise<IngestProgressResponse> {
  const response = await fetch('/api/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'No se pudo indexar el documento');
  }
  return data as IngestProgressResponse;
}
