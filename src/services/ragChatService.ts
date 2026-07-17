import type { ServerAppConfig } from '@/shared/config/schema';
import { embedText } from './embeddingService';
import { generateChatReply } from './generationService';
import {
  getChunksByDocumentId,
  getDocumentBySourceId,
} from './localIndexStore';
import { formatRetrievedContext, rankChunksBySimilarity } from './ragRetrievalService';

export interface RagChatRequest {
  sourceDocumentId: string;
  documentName: string;
  message: string;
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface RagChatResult {
  reply: string;
  mode: 'rag_local' | 'unavailable';
  chunkCount: number;
  topScores: number[];
}

/**
 * RAG local: embed query (Ollama CPU) → top-k SQLite → Groq con contexto recuperado.
 */
export async function answerWithLocalRag(
  request: RagChatRequest,
  config: ServerAppConfig
): Promise<RagChatResult> {
  if (config.ragMode === 'off') {
    throw new Error('RAG_MODE=off. Activa local para consultas vectoriales.');
  }

  const doc = getDocumentBySourceId(config.sqlitePath, request.sourceDocumentId);
  if (!doc || doc.indexStatus !== 'indexed_local') {
    return {
      reply: '',
      mode: 'unavailable',
      chunkCount: 0,
      topScores: [],
    };
  }

  const chunks = getChunksByDocumentId(config.sqlitePath, doc.id);
  const withVectors = chunks.filter((c) => c.embedding?.length);
  if (withVectors.length === 0) {
    return {
      reply: '',
      mode: 'unavailable',
      chunkCount: 0,
      topScores: [],
    };
  }

  const queryEmbedding = await embedText(request.message, config);
  const ranked = rankChunksBySimilarity(queryEmbedding, withVectors, config.ragTopK);
  const context = formatRetrievedContext(ranked);

  const system = `Eres un auditor legal e inmobiliario de Inverland Desarrollos.
Responde en español con precisión notarial.
Usa ÚNICAMENTE los fragmentos recuperados del expediente "${request.documentName}".
Si la respuesta no está en los fragmentos, dilo claramente.
No inventes cláusulas, montos ni fechas.
No menciones embeddings, SQLite ni infraestructura.`;

  const user = `FRAGMENTOS RECUPERADOS (RAG local):
${context}

PREGUNTA DEL USUARIO:
${request.message}`;

  const history = (request.chatHistory || []).slice(-6);

  const reply = await generateChatReply({
    config,
    system,
    history,
    message: user,
    temperature: 0.15,
  });

  return {
    reply,
    mode: 'rag_local',
    chunkCount: ranked.length,
    topScores: ranked.map((r) => Number(r.score.toFixed(4))),
  };
}
