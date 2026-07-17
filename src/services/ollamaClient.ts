import type { ServerAppConfig } from '@/shared/config/schema';

/** Opciones Ollama que fuerzan CPU (num_gpu: 0). */
export function ollamaCpuOptions(config: ServerAppConfig) {
  return {
    num_gpu: config.ollamaNumGpu,
    num_thread: config.ollamaNumThread,
  };
}

async function ollamaFetch(
  config: ServerAppConfig,
  path: string,
  body: Record<string, unknown>
): Promise<Response> {
  const url = `${config.ollamaBaseUrl}${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `Ollama ${path} falló (${response.status}): ${detail || response.statusText}`
    );
  }
  return response;
}

/**
 * Embedding vía Ollama. Siempre con options.num_gpu según config (default 0 = CPU).
 */
export async function ollamaEmbed(
  text: string,
  config: ServerAppConfig,
  model = config.embeddingModel
): Promise<number[]> {
  const response = await ollamaFetch(config, '/api/embeddings', {
    model,
    prompt: text,
    options: ollamaCpuOptions(config),
  });
  const data = (await response.json()) as { embedding?: number[] };
  if (!data.embedding?.length) {
    throw new Error('Ollama no devolvió embedding.');
  }
  return data.embedding;
}

/**
 * Generación de texto (chat/JSON) en Ollama CPU-only.
 */
export async function ollamaGenerate(
  prompt: string,
  config: ServerAppConfig,
  model = config.generationModel
): Promise<string> {
  const response = await ollamaFetch(config, '/api/generate', {
    model,
    prompt,
    stream: false,
    options: ollamaCpuOptions(config),
  });
  const data = (await response.json()) as { response?: string };
  return (data.response || '').trim();
}

/**
 * OCR / visión documental con glm-ocr (u otro modelo vision).
 * `imageBase64` sin prefijo data-URL.
 */
export async function ollamaOcrImage(
  imageBase64: string,
  config: ServerAppConfig,
  prompt =
    'Extrae TODO el texto visible del documento de forma fiel y completa, en español si aplica. Conserva saltos de línea. Solo texto, sin comentarios.'
): Promise<string> {
  const clean = imageBase64.includes(',')
    ? imageBase64.split(',').pop() || imageBase64
    : imageBase64;

  const response = await ollamaFetch(config, '/api/generate', {
    model: config.ocrModel,
    prompt,
    images: [clean],
    stream: false,
    options: ollamaCpuOptions(config),
  });
  const data = (await response.json()) as { response?: string };
  const text = (data.response || '').trim();
  if (!text) {
    throw new Error(`El modelo OCR (${config.ocrModel}) no devolvió texto.`);
  }
  return text;
}
