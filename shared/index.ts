/**
 * Barrel seguro para frontend + backend (tipos y defaults públicos).
 * Carga de secretos: `import { loadServerConfig } from '@/shared/config/loadServerConfig'`
 */
export * from './types';
export { APP_CONFIG_DEFAULTS } from './config/defaults';
export type {
  IngestMode,
  RagMode,
  EmbeddingProvider,
  OcrProvider,
  GenerationProvider,
  PublicAppConfig,
  ServerAppConfig,
} from './config/schema';
