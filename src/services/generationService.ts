import Groq from 'groq-sdk';
import type { ServerAppConfig } from '@/shared/config/schema';
import { ollamaGenerate } from './ollamaClient';

let groqClient: Groq | null = null;

function getGroq(apiKey: string): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence?.[1]?.trim() || trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('La respuesta del modelo no contiene JSON válido.');
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

/**
 * Chat / completion vía proveedor configurado (default Groq).
 * Ollama usa CPU (num_gpu: 0). No usa GPU.
 */
export async function generateText(params: {
  config: ServerAppConfig;
  system: string;
  user: string;
  temperature?: number;
}): Promise<string> {
  const { config, system, user, temperature = 0.2 } = params;

  if (config.generationProvider === 'groq') {
    if (!config.groqApiKey) {
      throw new Error('GENERATION_PROVIDER=groq requiere GROQ_API_KEY.');
    }
    const groq = getGroq(config.groqApiKey);
    const completion = await groq.chat.completions.create({
      model: config.generationModel,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('Groq no devolvió contenido.');
    return text;
  }

  if (config.generationProvider === 'ollama') {
    return ollamaGenerate(`${system}\n\n---\n\n${user}`, config, config.generationModel);
  }

  throw new Error(
    `Proveedor de generación no soportado en este build: ${config.generationProvider}`
  );
}

export async function generateChatReply(params: {
  config: ServerAppConfig;
  system: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  message: string;
  temperature?: number;
}): Promise<string> {
  const { config, system, history, message, temperature = 0.2 } = params;

  if (config.generationProvider === 'groq') {
    if (!config.groqApiKey) {
      throw new Error('GENERATION_PROVIDER=groq requiere GROQ_API_KEY.');
    }
    const groq = getGroq(config.groqApiKey);
    const completion = await groq.chat.completions.create({
      model: config.generationModel,
      temperature,
      messages: [
        { role: 'system', content: system },
        ...history.map((h) => ({
          role: h.role as 'user' | 'assistant',
          content: h.content,
        })),
        { role: 'user', content: message },
      ],
    });
    return (
      completion.choices[0]?.message?.content?.trim() ||
      'No pude generar una respuesta clara en este momento.'
    );
  }

  if (config.generationProvider === 'ollama') {
    const transcript = history
      .map((h) => `${h.role === 'assistant' ? 'Asistente' : 'Usuario'}: ${h.content}`)
      .join('\n');
    return ollamaGenerate(
      `${system}\n\nHistorial:\n${transcript}\n\nUsuario: ${message}\nAsistente:`,
      config,
      config.generationModel
    );
  }

  throw new Error(
    `Proveedor de generación no soportado en este build: ${config.generationProvider}`
  );
}
