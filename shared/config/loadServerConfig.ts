/**
 * Carga de configuración del SERVIDOR.
 * Importar SOLO desde Express / scripts Node (nunca desde el bundle de Vite).
 */

import { APP_CONFIG_DEFAULTS } from './defaults';
import type {
  EmbeddingProvider,
  GenerationProvider,
  IngestMode,
  OcrProvider,
  PublicAppConfig,
  RagMode,
  ServerAppConfig,
} from './schema';

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseNonNegativeInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function parseIngestMode(raw: string | undefined): IngestMode {
  if (raw === 'off' || raw === 'local') return raw;
  return APP_CONFIG_DEFAULTS.ingestMode;
}

function parseRagMode(raw: string | undefined): RagMode {
  if (raw === 'off' || raw === 'local' || raw === 'firebase') return raw;
  return APP_CONFIG_DEFAULTS.ragMode;
}

function parseEmbeddingProvider(raw: string | undefined): EmbeddingProvider {
  if (raw === 'ollama' || raw === 'gemini') return raw;
  return APP_CONFIG_DEFAULTS.embeddingProvider;
}

function parseOcrProvider(raw: string | undefined): OcrProvider {
  if (raw === 'ollama' || raw === 'gemini') return raw;
  return APP_CONFIG_DEFAULTS.ocrProvider;
}

function parseGenerationProvider(raw: string | undefined): GenerationProvider {
  if (raw === 'groq' || raw === 'gemini' || raw === 'ollama') return raw;
  return APP_CONFIG_DEFAULTS.generationProvider;
}

export function loadServerConfig(env: NodeJS.ProcessEnv = process.env): ServerAppConfig {
  return {
    port: parsePositiveInt(env.PORT, APP_CONFIG_DEFAULTS.port),
    geminiApiKey: env.GEMINI_API_KEY?.trim() || undefined,
    groqApiKey: env.GROQ_API_KEY?.trim() || undefined,
    appUrl: env.APP_URL?.trim() || undefined,
    ingestMode: parseIngestMode(env.INGEST_MODE),
    ragMode: parseRagMode(env.RAG_MODE),
    embeddingProvider: parseEmbeddingProvider(env.EMBEDDING_PROVIDER),
    embeddingModel: env.EMBEDDING_MODEL?.trim() || APP_CONFIG_DEFAULTS.embeddingModel,
    ocrProvider: parseOcrProvider(env.OCR_PROVIDER),
    ocrModel: env.OCR_MODEL?.trim() || APP_CONFIG_DEFAULTS.ocrModel,
    generationProvider: parseGenerationProvider(env.GENERATION_PROVIDER),
    generationModel: env.GENERATION_MODEL?.trim() || APP_CONFIG_DEFAULTS.generationModel,
    ollamaBaseUrl: (env.OLLAMA_BASE_URL?.trim() || APP_CONFIG_DEFAULTS.ollamaBaseUrl).replace(
      /\/$/,
      ''
    ),
    /** Forzar 0 por defecto: no usar GPU durante pruebas de otras apps */
    ollamaNumGpu: parseNonNegativeInt(env.OLLAMA_NUM_GPU, APP_CONFIG_DEFAULTS.ollamaNumGpu),
    ollamaNumThread: parsePositiveInt(env.OLLAMA_NUM_THREAD, APP_CONFIG_DEFAULTS.ollamaNumThread),
    chunkSizeTokens: parsePositiveInt(env.CHUNK_SIZE_TOKENS, APP_CONFIG_DEFAULTS.chunkSizeTokens),
    chunkOverlapTokens: parsePositiveInt(
      env.CHUNK_OVERLAP_TOKENS,
      APP_CONFIG_DEFAULTS.chunkOverlapTokens
    ),
    minExtractedChars: parsePositiveInt(
      env.MIN_EXTRACTED_CHARS,
      APP_CONFIG_DEFAULTS.minExtractedChars
    ),
    sqlitePath: env.SQLITE_PATH?.trim() || APP_CONFIG_DEFAULTS.sqlitePath,
    firebaseProjectId: env.FIREBASE_PROJECT_ID?.trim() || undefined,
    firestoreDocumentsCollection:
      env.FIRESTORE_DOCUMENTS_COLLECTION?.trim() ||
      APP_CONFIG_DEFAULTS.firestoreDocumentsCollection,
    firestoreChunksCollection:
      env.FIRESTORE_CHUNKS_COLLECTION?.trim() || APP_CONFIG_DEFAULTS.firestoreChunksCollection,
  };
}

export function toPublicConfig(config: ServerAppConfig): PublicAppConfig {
  return {
    ingestMode: config.ingestMode,
    ragMode: config.ragMode,
    chunkSizeTokens: config.chunkSizeTokens,
    chunkOverlapTokens: config.chunkOverlapTokens,
    embeddingModel: config.embeddingModel,
    generationModel: config.generationModel,
    embeddingProvider: config.embeddingProvider,
    generationProvider: config.generationProvider,
    ocrModel: config.ocrModel,
  };
}
