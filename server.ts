import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Allow JSON payloads up to 20MB for handling base64 PDFs or high-resolution images
app.use(express.json({ limit: '20mb' }));

// Helper function for Lazy Initialization of Google Gen AI
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined. Please configure it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Real Document Ingestion & Structured Extraction (Gemini 3.5 Flash)
app.post('/api/analyze', async (req, res) => {
  try {
    const { name, type, size, fileContent, base64Data, mimeType } = req.body;
    
    // Lazy get Gemini client
    const ai = getGeminiClient();

    let geminiContents: any[] = [];

    if (base64Data) {
      // Multimodal payload (Image or scanned PDF)
      geminiContents.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType || 'image/png'
        }
      });
    } else {
      // Text-based payload (CSV, TXT, OCR Stream)
      geminiContents.push({
        text: `Nombre del archivo: ${name}\nTamaño: ${size}\nTipo: ${type}\n\nContenido:\n${fileContent}`
      });
    }

    // Append analysis instruction
    geminiContents.push({
      text: `Eres un experto legal, notario público y auditor de contratos de bienes raíces (inmobiliaria). 
Analiza detalladamente este expediente inmobiliario (escritura pública de compraventa, contrato de arrendamiento o plano/zonificación). 
Extrae toda la información relevante y estructura la respuesta EXACTAMENTE según el esquema JSON especificado. 
Asegúrate de:
1. Resumir la esencia en la clave "summary" en español.
2. Identificar compradores, vendedores, notarios, claves catastrales o ubicaciones en "entities".
3. Extraer áreas/superficies (en m²), montos de transacción, monedas y plazos/vigencias en "metrics".
4. Extraer fechas clave de firma, vencimiento o registro en "dates".
5. Extraer las cláusulas más importantes y evaluar su nivel de riesgo legal ("low", "medium", "high") explicando por qué.
6. Generar alertas preventivas en "alerts" con tipo "critical", "warning" o "info".
7. Generar un dictamen o resumen ejecutivo detallado y profesional de los riesgos legales y financieros identificados, junto con recomendaciones de mitigación clave para la inmobiliaria en "legalRiskSummary" en español.
8. Extraer hitos, fechas límite, renovaciones, vigencias o plazos críticos de cumplimiento en "criticalDeadlines", asignando un título corto y claro ("title"), fecha estimada o exacta en formato YYYY-MM-DD ("date"), prioridad ('low', 'medium' o 'high') ("priority") y una descripción explicativa de las implicaciones o consecuencias en español ("description").
9. Realizar un OCR / transcripción exhaustiva y fidedigna de todo el texto, anotaciones, dimensiones, leyendas o cláusulas del documento/plano original en español, preservando saltos de línea, y guardándolo en la clave "extractedText".`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: geminiContents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumen ejecutivo corto del expediente en español." },
            legalRiskSummary: { type: Type.STRING, description: "Resumen ejecutivo formal detallando los riesgos legales y financieros del contrato/expediente junto con sugerencias de mitigación en español." },
            entities: {
              type: Type.OBJECT,
              properties: {
                buyerOrTenant: { type: Type.STRING, description: "Nombre completo de la parte compradora, adquirente o arrendataria." },
                sellerOrLandlord: { type: Type.STRING, description: "Nombre completo de la parte vendedora, transmitente o arrendadora." },
                notary: { type: Type.STRING, description: "Notaría Pública y Notario que firma, o dependencia que emite el plano." },
                propertyAddress: { type: Type.STRING, description: "Dirección física completa del inmueble." },
                cadastralKey: { type: Type.STRING, description: "Clave o cuenta catastral del predio." }
              }
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                surfaceArea: { type: Type.STRING, description: "Área o superficie del terreno o construcción (ej. 150 m²)." },
                transactionAmount: { type: Type.STRING, description: "Monto de transacción, precio o renta mensual (ej. 4500000 o 35000)." },
                currency: { type: Type.STRING, description: "Moneda usada (ej. MXN, USD)." },
                duration: { type: Type.STRING, description: "Plazo o vigencia del contrato (ej. 36 meses, Indefinido)." }
              }
            },
            dates: {
              type: Type.OBJECT,
              properties: {
                signingDate: { type: Type.STRING, description: "Fecha de firma o firma de escritura (YYYY-MM-DD)." },
                expirationDate: { type: Type.STRING, description: "Fecha de vencimiento o terminación (YYYY-MM-DD)." },
                registrationDate: { type: Type.STRING, description: "Fecha de inscripción o registro oficial (YYYY-MM-DD)." }
              }
            },
            criticalDeadlines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Título breve del hito o plazo crítico (ej. Pago de Renta, Renovación)." },
                  date: { type: Type.STRING, description: "Fecha límite en formato YYYY-MM-DD o descripción de cuándo ocurre." },
                  description: { type: Type.STRING, description: "Explicación detallada del plazo y consecuencias de incumplimiento." },
                  priority: { type: Type.STRING, description: "Prioridad del hito: 'low', 'medium' o 'high'." }
                },
                required: ["title", "date", "description", "priority"]
              }
            },
            keyClauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Título de la cláusula analizada." },
                  summary: { type: Type.STRING, description: "Resumen del contenido de la cláusula en español." },
                  risk: { type: Type.STRING, description: "Nivel de riesgo estimado para las partes: 'low', 'medium' o 'high'." },
                  riskExplanation: { type: Type.STRING, description: "Justificación de por qué tiene este nivel de riesgo." }
                },
                required: ["title", "summary", "risk", "riskExplanation"]
              }
            },
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Tipo de alerta: 'critical', 'warning' o 'info'." },
                  message: { type: Type.STRING, description: "Mensaje explicativo de la alerta." }
                },
                required: ["type", "message"]
              }
            },
            extractedText: { type: Type.STRING, description: "Transcripción OCR completa del texto, cláusulas o anotaciones del plano/documento en español." }
          },
          required: ["summary", "legalRiskSummary", "entities", "metrics", "dates", "keyClauses", "alerts", "criticalDeadlines", "extractedText"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    
    // Add additional fields for compatibility with the frontend
    parsedData.ocrExtracted = true;
    parsedData.ocrMethodUsed = base64Data ? 'Gemini 3.5 Multimodal Vision OCR' : 'Gemini 3.5 Native Text Parser';

    return res.status(200).json({
      id: `doc-${Date.now()}`,
      analysis: parsedData
    });

  } catch (error: any) {
    console.error('Error en /api/analyze:', error);
    return res.status(500).json({
      error: 'Error de análisis en el servidor',
      message: error.message
    });
  }
});

// 2.5. AI Side-by-Side Document Comparison
app.post('/api/compare', async (req, res) => {
  try {
    const { docAName, docAContent, docBName, docBContent } = req.body;
    const ai = getGeminiClient();

    const comparisonPrompt = `Eres un auditor legal e inmobiliario experto de la empresa Inverland Desarrollos.
Compara detalladamente los siguientes dos expedientes inmobiliarios / contratos lado a lado.
Identifica inconsistencias, diferencias en montos, áreas de terreno/construcción, partes firmantes, fechas clave, penalizaciones, prórrogas o cualquier discrepancia que represente un riesgo legal o financiero.

DOCUMENTO A:
Nombre: ${docAName}
Datos/Contenido: ${docAContent}

DOCUMENTO B:
Nombre: ${docBName}
Datos/Contenido: ${docBContent}

Analiza y estructura tu respuesta EXACTAMENTE de acuerdo al esquema JSON solicitado. Asegúrate de dar detalles precisos y explicaciones de riesgo legal rigurosas en español.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ text: comparisonPrompt }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumen comparativo general en español que sintetiza las principales discrepancias o hallazgos." },
            differences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "Categoría de la diferencia: 'Partes', 'Métricas', 'Fechas', 'Cláusulas', 'Otros'." },
                  severity: { type: Type.STRING, description: "Severidad de la discrepancia para el negocio: 'low', 'medium', 'high'." },
                  field: { type: Type.STRING, description: "Nombre del aspecto o campo comparado (ej. Comprador, Superficie m², Fecha de firma, Cláusula de rescisión)." },
                  docAValue: { type: Type.STRING, description: "Valor o descripción del aspecto en el Documento A." },
                  docBValue: { type: Type.STRING, description: "Valor o descripción del aspecto en el Documento B." },
                  description: { type: Type.STRING, description: "Explicación detallada de por qué difieren y el riesgo legal o financiero asociado." }
                },
                required: ["category", "severity", "field", "docAValue", "docBValue", "description"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Acciones recomendadas concretas para conciliar o mitigar los riesgos derivados de estas diferencias."
            }
          },
          required: ["summary", "differences", "recommendations"]
        }
      }
    });

    const parsedComparison = JSON.parse(response.text || '{}');
    return res.status(200).json(parsedComparison);

  } catch (error: any) {
    console.error('Error en /api/compare:', error);
    return res.status(500).json({
      error: 'Error de análisis comparativo en el servidor',
      message: error.message
    });
  }
});

// 3. Chat Inteligente de Consulta de Cláusulas (RAG / In-Context Q&A)
app.post('/api/chat', async (req, res) => {
  try {
    const { documentContent, documentName, chatHistory, message } = req.body;
    
    // Lazy get Gemini client
    const ai = getGeminiClient();

    // Construct the context-enriched prompt
    const systemPrompt = `Eres un auditor legal e inmobiliario experto y altamente competente.
Tu objetivo es responder con precisión y profesionalismo absoluto a las preguntas del usuario sobre el siguiente documento:
Documento: ${documentName}
Contenido extraído / metadatos:
${documentContent}

INSTRUCCIONES DE RESPUESTA:
1. Responde de manera clara, concisa y objetiva en español.
2. Apóyate ÚNICAMENTE en la información disponible del documento. Si un dato no se menciona en absoluto (por ejemplo, si te preguntan una clave catastral que no viene declarada), dilo amablemente y advierte que podría ser un riesgo no tenerlo declarado.
3. Clasifica el tono de manera que sea constructivo pero con carácter notarial y legal de alta fidelidad.
4. No menciones detalles de implementación interna o tokens. Centrate en asesorar de forma idónea a la inmobiliaria o a su cliente.`;

    // Reconstruct the contents using previous chat history if provided
    const contents: any[] = [];
    
    // For general text-generation chat we can pass system instruction in config
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        ...chatHistory.map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2 // Low temperature for high precision legal answers
      }
    });

    return res.status(200).json({
      reply: response.text || 'No pude generar una respuesta clara en este momento.'
    });

  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return res.status(500).json({
      error: 'Error de procesamiento en chat',
      message: error.message
    });
  }
});

// -------------------------------------------------------------
// Vite and Static File Serving Configuration
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode: Mount Vite development middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: Serve compiled static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully booted on port ${PORT} with PID ${process.pid}`);
  });
}

startServer();
