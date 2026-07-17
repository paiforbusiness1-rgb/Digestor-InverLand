import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import type { ChunkRecord, DocumentRecord, IndexStatus } from '@/shared/types/rag';

let db: Database.Database | null = null;

function rowToDocument(row: Record<string, unknown>): DocumentRecord {
  return {
    id: String(row.id),
    sourceDocumentId: String(row.source_document_id),
    name: String(row.name),
    category: row.category as DocumentRecord['category'],
    mimeType: row.mime_type ? String(row.mime_type) : undefined,
    indexStatus: row.index_status as IndexStatus,
    chunkCount: Number(row.chunk_count) || 0,
    embeddingModel: String(row.embedding_model),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    errorMessage: row.error_message ? String(row.error_message) : undefined,
    firebaseDocId: row.firebase_doc_id ? String(row.firebase_doc_id) : undefined,
  };
}

function rowToChunk(row: Record<string, unknown>): ChunkRecord {
  const embeddingRaw = row.embedding as string | null;
  return {
    id: String(row.id),
    documentId: String(row.document_id),
    chunkIndex: Number(row.chunk_index),
    content: String(row.content),
    embedding: embeddingRaw ? (JSON.parse(embeddingRaw) as number[]) : null,
    tokenEstimate: row.token_estimate != null ? Number(row.token_estimate) : undefined,
    metadata: JSON.parse(String(row.metadata || '{}')),
    createdAt: String(row.created_at),
  };
}

export function getLocalIndexDb(sqlitePath: string): Database.Database {
  if (db) return db;

  const absolute = path.isAbsolute(sqlitePath)
    ? sqlitePath
    : path.join(process.cwd(), sqlitePath);

  fs.mkdirSync(path.dirname(absolute), { recursive: true });

  db = new Database(absolute);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      source_document_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      mime_type TEXT,
      index_status TEXT NOT NULL,
      chunk_count INTEGER NOT NULL DEFAULT 0,
      embedding_model TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      error_message TEXT,
      firebase_doc_id TEXT
    );

    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      content TEXT NOT NULL,
      embedding TEXT,
      token_estimate INTEGER,
      metadata TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
  `);

  return db;
}

export function upsertDocument(sqlitePath: string, doc: DocumentRecord): DocumentRecord {
  const database = getLocalIndexDb(sqlitePath);
  database
    .prepare(
      `INSERT INTO documents (
        id, source_document_id, name, category, mime_type, index_status,
        chunk_count, embedding_model, created_at, updated_at, error_message, firebase_doc_id
      ) VALUES (
        @id, @sourceDocumentId, @name, @category, @mimeType, @indexStatus,
        @chunkCount, @embeddingModel, @createdAt, @updatedAt, @errorMessage, @firebaseDocId
      )
      ON CONFLICT(source_document_id) DO UPDATE SET
        id=excluded.id,
        name=excluded.name,
        category=excluded.category,
        mime_type=excluded.mime_type,
        index_status=excluded.index_status,
        chunk_count=excluded.chunk_count,
        embedding_model=excluded.embedding_model,
        updated_at=excluded.updated_at,
        error_message=excluded.error_message,
        firebase_doc_id=excluded.firebase_doc_id`
    )
    .run({
      id: doc.id,
      sourceDocumentId: doc.sourceDocumentId,
      name: doc.name,
      category: doc.category,
      mimeType: doc.mimeType ?? null,
      indexStatus: doc.indexStatus,
      chunkCount: doc.chunkCount,
      embeddingModel: doc.embeddingModel,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      errorMessage: doc.errorMessage ?? null,
      firebaseDocId: doc.firebaseDocId ?? null,
    });
  return doc;
}

export function updateDocumentStatus(
  sqlitePath: string,
  documentId: string,
  indexStatus: IndexStatus,
  extras?: { chunkCount?: number; errorMessage?: string | null }
): void {
  const database = getLocalIndexDb(sqlitePath);
  database
    .prepare(
      `UPDATE documents SET
        index_status = @indexStatus,
        updated_at = @updatedAt,
        chunk_count = COALESCE(@chunkCount, chunk_count),
        error_message = @errorMessage
      WHERE id = @documentId`
    )
    .run({
      documentId,
      indexStatus,
      updatedAt: new Date().toISOString(),
      chunkCount: extras?.chunkCount ?? null,
      errorMessage: extras?.errorMessage === undefined ? null : extras.errorMessage,
    });
}

export function replaceChunks(sqlitePath: string, documentId: string, chunks: ChunkRecord[]): void {
  const database = getLocalIndexDb(sqlitePath);
  const del = database.prepare('DELETE FROM chunks WHERE document_id = ?');
  const insert = database.prepare(
    `INSERT INTO chunks (
      id, document_id, chunk_index, content, embedding, token_estimate, metadata, created_at
    ) VALUES (
      @id, @documentId, @chunkIndex, @content, @embedding, @tokenEstimate, @metadata, @createdAt
    )`
  );

  const tx = database.transaction(() => {
    del.run(documentId);
    for (const chunk of chunks) {
      insert.run({
        id: chunk.id,
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        embedding: chunk.embedding ? JSON.stringify(chunk.embedding) : null,
        tokenEstimate: chunk.tokenEstimate ?? null,
        metadata: JSON.stringify(chunk.metadata ?? {}),
        createdAt: chunk.createdAt,
      });
    }
  });
  tx();
}

export function updateChunkEmbedding(
  sqlitePath: string,
  chunkId: string,
  embedding: number[]
): void {
  const database = getLocalIndexDb(sqlitePath);
  database
    .prepare('UPDATE chunks SET embedding = ? WHERE id = ?')
    .run(JSON.stringify(embedding), chunkId);
}

export function getDocumentBySourceId(
  sqlitePath: string,
  sourceDocumentId: string
): DocumentRecord | null {
  const database = getLocalIndexDb(sqlitePath);
  const row = database
    .prepare('SELECT * FROM documents WHERE source_document_id = ?')
    .get(sourceDocumentId) as Record<string, unknown> | undefined;
  return row ? rowToDocument(row) : null;
}

export function getChunksByDocumentId(
  sqlitePath: string,
  documentId: string
): ChunkRecord[] {
  const database = getLocalIndexDb(sqlitePath);
  const rows = database
    .prepare('SELECT * FROM chunks WHERE document_id = ? ORDER BY chunk_index ASC')
    .all(documentId) as Record<string, unknown>[];
  return rows.map(rowToChunk);
}

export function deleteDocumentBySourceId(
  sqlitePath: string,
  sourceDocumentId: string
): void {
  const database = getLocalIndexDb(sqlitePath);
  const existing = getDocumentBySourceId(sqlitePath, sourceDocumentId);
  if (!existing) return;
  database.prepare('DELETE FROM chunks WHERE document_id = ?').run(existing.id);
  database.prepare('DELETE FROM documents WHERE id = ?').run(existing.id);
}
