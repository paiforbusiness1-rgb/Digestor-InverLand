import type { ChunkMetadata, ChunkSource } from '@/shared/types/rag';

export interface TextChunk {
  chunkIndex: number;
  content: string;
  tokenEstimate: number;
  metadata: ChunkMetadata;
}

/** Estimación aproximada: ~4 chars por token (español legal). */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

/**
 * Parte texto en chunks por tamaño/overlap configurables (HRU: sin hardcode en callers).
 */
export function chunkText(
  text: string,
  options: {
    chunkSizeTokens: number;
    chunkOverlapTokens: number;
    source: ChunkSource;
  }
): TextChunk[] {
  const { chunkSizeTokens, chunkOverlapTokens, source } = options;
  const sizeChars = Math.max(200, chunkSizeTokens * 4);
  const overlapChars = Math.max(0, Math.min(chunkOverlapTokens * 4, sizeChars - 50));

  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const units = paragraphs.length > 0 ? paragraphs : [text];

  const chunks: TextChunk[] = [];
  let buffer = '';
  let chunkIndex = 0;

  const flush = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    chunks.push({
      chunkIndex,
      content: trimmed,
      tokenEstimate: estimateTokens(trimmed),
      metadata: { source },
    });
    chunkIndex += 1;
  };

  for (const unit of units) {
    if (!buffer) {
      buffer = unit;
      continue;
    }
    const candidate = `${buffer}\n\n${unit}`;
    if (candidate.length <= sizeChars) {
      buffer = candidate;
    } else {
      flush(buffer);
      if (overlapChars > 0 && buffer.length > overlapChars) {
        buffer = `${buffer.slice(-overlapChars)}\n\n${unit}`;
      } else {
        buffer = unit;
      }
      while (buffer.length > sizeChars) {
        flush(buffer.slice(0, sizeChars));
        buffer = buffer.slice(sizeChars - overlapChars);
      }
    }
  }

  if (buffer.trim()) flush(buffer);

  if (chunks.length === 0) {
    flush(text.slice(0, sizeChars));
  }

  return chunks;
}
