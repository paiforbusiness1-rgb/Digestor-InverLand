import type { ServerAppConfig } from '@/shared/config/schema';
import { ollamaEmbed } from './ollamaClient';

/**
 * Genera embedding. Por defecto Ollama `nomic-embed-text` en CPU (num_gpu: 0).
 */
export async function embedText(
  text: string,
  config: ServerAppConfig
): Promise<number[]> {
  if (config.embeddingProvider === 'ollama') {
    return ollamaEmbed(text, config, config.embeddingModel);
  }

  // Fallback Gemini solo si está configurado explícitamente
  const { GoogleGenAI } = await import('@google/genai');
  if (!config.geminiApiKey) {
    throw new Error('EMBEDDING_PROVIDER=gemini requiere GEMINI_API_KEY.');
  }
  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
  const response = await ai.models.embedContent({
    model: config.embeddingModel,
    contents: text,
    config: { taskType: 'RETRIEVAL_DOCUMENT' },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values?.length) {
    throw new Error('Gemini no devolvió embedding.');
  }
  return values as number[];
}

export async function embedTexts(
  texts: string[],
  config: ServerAppConfig
): Promise<number[][]> {
  const vectors: number[][] = [];
  for (const text of texts) {
    vectors.push(await embedText(text, config));
  }
  return vectors;
}
