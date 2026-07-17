/**
 * Valores por defecto centralizados (única fuente HRU).
 * Sin secretos. Pipeline local: Ollama CPU + Groq cloud para chat.
 */

export const APP_CONFIG_DEFAULTS = {
  port: 3000,
  ingestMode: 'local' as const,
  ragMode: 'local' as const,

  /** ollama | gemini — embeddings del índice RAG */
  embeddingProvider: 'ollama' as const,
  embeddingModel: 'nomic-embed-text',

  /** ollama | gemini — OCR / visión documental */
  ocrProvider: 'ollama' as const,
  ocrModel: 'glm-ocr',

  /** groq | gemini | ollama — generación de texto (chat / analyze JSON) */
  generationProvider: 'groq' as const,
  /** Modelo Groq por defecto (rápido, bajo costo en pruebas) */
  generationModel: 'llama-3.1-8b-instant',

  ollamaBaseUrl: 'http://127.0.0.1:11434',
  /** 0 = forzar CPU en Ollama (no usar GPU) */
  ollamaNumGpu: 0,
  ollamaNumThread: 4,

  chunkSizeTokens: 700,
  chunkOverlapTokens: 70,
  sqlitePath: 'data/local-index.sqlite',
  firestoreDocumentsCollection: 'documents',
  firestoreChunksCollection: 'chunks',

  /** Umbral: por debajo se intenta OCR visual */
  minExtractedChars: 80,

  /** RAG local: fragmentos a recuperar */
  ragTopK: 5,
} as const;
