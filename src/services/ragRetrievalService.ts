import type { ChunkRecord } from '@/shared/types/rag';

export interface ScoredChunk {
  chunk: ChunkRecord;
  score: number;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return -1;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return -1;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Ranking por similitud coseno. Solo chunks con embedding.
 */
export function rankChunksBySimilarity(
  queryEmbedding: number[],
  chunks: ChunkRecord[],
  topK: number
): ScoredChunk[] {
  const scored: ScoredChunk[] = [];
  for (const chunk of chunks) {
    if (!chunk.embedding?.length) continue;
    const score = cosineSimilarity(queryEmbedding, chunk.embedding);
    if (score < 0) continue;
    scored.push({ chunk, score });
  }
  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, Math.max(1, topK));
}

export function formatRetrievedContext(scored: ScoredChunk[]): string {
  if (scored.length === 0) {
    return 'No se recuperaron fragmentos indexados relevantes.';
  }
  return scored
    .map(
      (s, i) =>
        `[Fragmento ${i + 1} | score=${s.score.toFixed(3)} | chunk#${s.chunk.chunkIndex}]\n${s.chunk.content}`
    )
    .join('\n\n---\n\n');
}
