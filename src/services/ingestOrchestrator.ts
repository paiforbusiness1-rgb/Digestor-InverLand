import { randomUUID } from 'crypto';
import type { ServerAppConfig } from '@/shared/config/schema';
import type {
  ChunkRecord,
  DocumentCategory,
  DocumentRecord,
  IngestProgressResponse,
  IngestRequest,
} from '@/shared/types/rag';
import { normalizeExtractedText } from './textExtractionService';
import { chunkText } from './chunkingService';
import { embedText } from './embeddingService';
import {
  deleteDocumentBySourceId,
  replaceChunks,
  updateChunkEmbedding,
  updateDocumentStatus,
  upsertDocument,
} from './localIndexStore';

function nowIso(): string {
  return new Date().toISOString();
}

function statusMessage(status: DocumentRecord['indexStatus'], chunkCount = 0): string {
  switch (status) {
    case 'extracting':
      return 'Extrayendo y normalizando texto…';
    case 'chunking':
      return 'Dividiendo el expediente en fragmentos…';
    case 'embedding':
      return 'Generando embeddings en el servidor…';
    case 'indexed_local':
      return `Índice local listo (${chunkCount} fragmentos). Disponible para consulta móvil en Fase 3–4.`;
    case 'indexing_failed':
      return 'La indexación falló. Puedes reintentar.';
    default:
      return 'Procesando índice…';
  }
}

/**
 * Orquesta: extracción → chunking → embeddings → SQLite.
 * No toca el chat in-context ni Firebase real.
 */
export async function runLocalIngest(
  request: IngestRequest,
  config: ServerAppConfig
): Promise<IngestProgressResponse> {
  if (config.ingestMode === 'off') {
    throw new Error('La indexación está deshabilitada (INGEST_MODE=off).');
  }

  const createdAt = nowIso();
  const documentId = randomUUID();

  // Reindex: limpia índice previo del mismo sourceDocumentId
  deleteDocumentBySourceId(config.sqlitePath, request.sourceDocumentId);

  let document: DocumentRecord = {
    id: documentId,
    sourceDocumentId: request.sourceDocumentId,
    name: request.name,
    category: request.category as DocumentCategory,
    mimeType: request.mimeType,
    indexStatus: 'extracting',
    chunkCount: 0,
    embeddingModel: config.embeddingModel,
    createdAt,
    updatedAt: createdAt,
  };

  upsertDocument(config.sqlitePath, document);

  try {
    const normalized = normalizeExtractedText(request.extractedText, 'analysis_extracted');

    document = {
      ...document,
      indexStatus: 'chunking',
      updatedAt: nowIso(),
    };
    upsertDocument(config.sqlitePath, document);

    const textChunks = chunkText(normalized.text, {
      chunkSizeTokens: config.chunkSizeTokens,
      chunkOverlapTokens: config.chunkOverlapTokens,
      source: normalized.source,
    });

    const chunkRecords: ChunkRecord[] = textChunks.map((c) => ({
      id: randomUUID(),
      documentId,
      chunkIndex: c.chunkIndex,
      content: c.content,
      embedding: null,
      tokenEstimate: c.tokenEstimate,
      metadata: c.metadata,
      createdAt: nowIso(),
    }));

    replaceChunks(config.sqlitePath, documentId, chunkRecords);
    updateDocumentStatus(config.sqlitePath, documentId, 'embedding', {
      chunkCount: chunkRecords.length,
      errorMessage: null,
    });

    document = {
      ...document,
      indexStatus: 'embedding',
      chunkCount: chunkRecords.length,
      updatedAt: nowIso(),
      errorMessage: undefined,
    };

    for (const chunk of chunkRecords) {
      const vector = await embedText(chunk.content, config);
      updateChunkEmbedding(config.sqlitePath, chunk.id, vector);
      chunk.embedding = vector;
    }

    document = {
      ...document,
      indexStatus: 'indexed_local',
      chunkCount: chunkRecords.length,
      updatedAt: nowIso(),
      errorMessage: undefined,
    };
    upsertDocument(config.sqlitePath, document);

    return {
      document,
      message: statusMessage('indexed_local', chunkRecords.length),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido en ingesta';
    document = {
      ...document,
      indexStatus: 'indexing_failed',
      updatedAt: nowIso(),
      errorMessage: message,
    };
    upsertDocument(config.sqlitePath, document);
    return {
      document,
      message: `${statusMessage('indexing_failed')} ${message}`,
    };
  }
}
