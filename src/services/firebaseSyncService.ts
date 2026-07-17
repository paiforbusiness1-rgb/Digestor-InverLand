import type { DocumentRecord } from '@/shared/types/rag';

/**
 * Stub Fase 4 — sync de chunks/embeddings a Firestore Vector Search.
 * No realiza I/O de red todavía.
 */
export async function syncDocumentToFirebase(
  _document: DocumentRecord
): Promise<{ ok: false; reason: string }> {
  return {
    ok: false,
    reason: 'Firebase sync aún no habilitado (Fase 4). El índice local está listo.',
  };
}
