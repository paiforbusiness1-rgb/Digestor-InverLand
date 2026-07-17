import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { loadServerConfig } from './shared/config/loadServerConfig';
import { runLocalIngest } from './src/services/ingestOrchestrator';
import {
  analyzeDocumentLocal,
  compareDocumentsLocal,
} from './src/services/documentAnalyzeService';
import { generateChatReply } from './src/services/generationService';
import { answerWithLocalRag } from './src/services/ragChatService';

dotenv.config();

const app = express();
const serverConfig = loadServerConfig();
const PORT = serverConfig.port;

// Allow JSON payloads up to 20MB for handling base64 PDFs or high-resolution images
app.use(express.json({ limit: '20mb' }));

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  const config = loadServerConfig();
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    providers: {
      generation: config.generationProvider,
      embedding: config.embeddingProvider,
      ocr: config.ocrProvider,
      ollamaNumGpu: config.ollamaNumGpu,
    },
  });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const config = loadServerConfig();
    const { name, type, size, fileContent, base64Data, mimeType } = req.body ?? {};

    if (!name) {
      return res.status(400).json({
        error: 'Payload inválido',
        message: 'Se requiere name del documento.',
      });
    }

    const { analysis } = await analyzeDocumentLocal(
      { name, type, size, fileContent, base64Data, mimeType },
      config
    );

    return res.status(200).json({
      id: `doc-${Date.now()}`,
      analysis,
    });
  } catch (error: any) {
    console.error('Error en /api/analyze:', error);
    return res.status(500).json({
      error: 'Error de análisis en el servidor',
      message: error.message,
    });
  }
});

app.post('/api/compare', async (req, res) => {
  try {
    const config = loadServerConfig();
    const { docAName, docAContent, docBName, docBContent } = req.body ?? {};
    const parsedComparison = await compareDocumentsLocal(
      { docAName, docAContent, docBName, docBContent },
      config
    );
    return res.status(200).json(parsedComparison);
  } catch (error: any) {
    console.error('Error en /api/compare:', error);
    return res.status(500).json({
      error: 'Error de análisis comparativo en el servidor',
      message: error.message,
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const config = loadServerConfig();
    const { documentContent, documentName, chatHistory, message } = req.body ?? {};

    const systemPrompt = `Eres un auditor legal e inmobiliario experto y altamente competente.
Tu objetivo es responder con precisión y profesionalismo absoluto a las preguntas del usuario sobre el siguiente documento:
Documento: ${documentName}
Contenido extraído / metadatos:
${documentContent}

INSTRUCCIONES DE RESPUESTA:
1. Responde de manera clara, concisa y objetiva en español.
2. Apóyate ÚNICAMENTE en la información disponible del documento. Si un dato no se menciona, dilo amablemente.
3. Tono constructivo con carácter notarial y legal.
4. No menciones detalles de implementación interna o tokens.`;

    const history = Array.isArray(chatHistory)
      ? chatHistory.map((h: { role?: string; content?: string }) => ({
          role: (h.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: String(h.content || ''),
        }))
      : [];

    const reply = await generateChatReply({
      config,
      system: systemPrompt,
      history,
      message: String(message || ''),
      temperature: 0.2,
    });

    return res.status(200).json({ reply, mode: 'in_context' });
  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return res.status(500).json({
      error: 'Error de procesamiento en chat',
      message: error.message,
    });
  }
});

/** Fase 3 — RAG local (SQLite + embeddings Ollama CPU + Groq) */
app.post('/api/rag/chat', async (req, res) => {
  try {
    const config = loadServerConfig();
    const { sourceDocumentId, documentName, message, chatHistory } = req.body ?? {};

    if (!sourceDocumentId || !message) {
      return res.status(400).json({
        error: 'Payload inválido',
        message: 'Se requieren sourceDocumentId y message.',
      });
    }

    const history = Array.isArray(chatHistory)
      ? chatHistory.map((h: { role?: string; content?: string }) => ({
          role: (h.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: String(h.content || ''),
        }))
      : [];

    const result = await answerWithLocalRag(
      {
        sourceDocumentId: String(sourceDocumentId),
        documentName: String(documentName || 'Expediente'),
        message: String(message),
        chatHistory: history,
      },
      config
    );

    if (result.mode === 'unavailable') {
      return res.status(409).json({
        error: 'Índice no disponible',
        message:
          'Este expediente aún no está indexado en local. Usa «Indexar para consulta móvil» o el chat estándar.',
        mode: result.mode,
      });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error en /api/rag/chat:', error);
    return res.status(500).json({
      error: 'Error de chat RAG',
      message: error.message,
    });
  }
});

app.post('/api/ingest', async (req, res) => {
  try {
    const config = loadServerConfig();
    if (config.ingestMode === 'off') {
      return res.status(403).json({
        error: 'Ingesta deshabilitada',
        message: 'INGEST_MODE=off. Activa local en .env para indexar.',
      });
    }

    const { sourceDocumentId, name, category, mimeType, extractedText } = req.body ?? {};

    if (!sourceDocumentId || !name || !category || typeof extractedText !== 'string') {
      return res.status(400).json({
        error: 'Payload inválido',
        message:
          'Se requieren sourceDocumentId, name, category y extractedText para indexar.',
      });
    }

    const result = await runLocalIngest(
      {
        sourceDocumentId: String(sourceDocumentId),
        name: String(name),
        category,
        mimeType: mimeType ? String(mimeType) : undefined,
        extractedText,
      },
      config
    );

    const statusCode = result.document.indexStatus === 'indexing_failed' ? 422 : 200;
    return res.status(statusCode).json(result);
  } catch (error: any) {
    console.error('Error en /api/ingest:', error);
    return res.status(500).json({
      error: 'Error de ingesta local',
      message: error.message,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const cfg = loadServerConfig();
    console.log(`Server successfully booted on port ${PORT} with PID ${process.pid}`);
    console.log(
      `[providers] generation=${cfg.generationProvider} embedding=${cfg.embeddingProvider} ocr=${cfg.ocrProvider} ollamaNumGpu=${cfg.ollamaNumGpu}`
    );
  });
}

startServer();
