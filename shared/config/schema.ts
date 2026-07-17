/**
 * Esquema tipado de configuración de la aplicación.
 */

export type IngestMode = 'off' | 'local';
export type RagMode = 'off' | 'local' | 'firebase';
export type EmbeddingProvider = 'ollama' | 'gemini';
export type OcrProvider = 'ollama' | 'gemini';
export type GenerationProvider = 'groq' | 'gemini' | 'ollama';

/** Configuración segura para exponer al frontend (sin API keys). */
export interface PublicAppConfig {
  ingestMode: IngestMode;
  ragMode: RagMode;
  chunkSizeTokens: number;
  chunkOverlapTokens: number;
  embeddingModel: string;
  generationModel: string;
  embeddingProvider: EmbeddingProvider;
  generationProvider: GenerationProvider;
  ocrModel: string;
}

/** Configuración completa del servidor Express. Secretos solo aquí. */
export interface ServerAppConfig extends PublicAppConfig {
  port: number;
  geminiApiKey: string | undefined;
  groqApiKey: string | undefined;
  appUrl: string | undefined;
  sqlitePath: string;
  firebaseProjectId: string | undefined;
  firestoreDocumentsCollection: string;
  firestoreChunksCollection: string;
  ocrProvider: OcrProvider;
  ollamaBaseUrl: string;
  ollamaNumGpu: number;
  ollamaNumThread: number;
  minExtractedChars: number;
}
