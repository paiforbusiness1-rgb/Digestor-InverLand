import React, { useState } from 'react';
import { 
  Layers, 
  Workflow, 
  Database, 
  Cpu, 
  Search, 
  TrendingUp, 
  CheckCircle, 
  Code2, 
  Lock, 
  Copy, 
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ArchitectureView() {
  const [activeTab, setActiveTab] = useState<'stack' | 'flow' | 'firebase' | 'vercel' | 'semantic' | 'scale'>('stack');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const codeSnippets = {
    firestoreRules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper: Verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper: Verificar rol del usuario en la inmobiliaria
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isAgentOrAdmin() {
      return isAuthenticated() && (
        getUserData().role == 'agent' || 
        getUserData().role == 'admin'
      );
    }

    // Colección de Usuarios
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }

    // Colección de Documentos Inmobiliarios
    match /documents/{documentId} {
      allow read: if isAuthenticated() && (
        resource.data.ownerId == request.auth.uid || isAgentOrAdmin()
      );
      allow create: if isAuthenticated() && (
        request.resource.data.ownerId == request.auth.uid || isAgentOrAdmin()
      );
      allow update, delete: if isAuthenticated() && (
        resource.data.ownerId == request.auth.uid || isAgentOrAdmin()
      );

      // Subcolección de Fragmentos para Búsqueda Semántica (Embeddings)
      match /chunks/{chunkId} {
        allow read: if isAuthenticated();
        allow write: if isAgentOrAdmin();
      }

      // Subcolección de Conversaciones/Chat asociadas
      match /chats/{chatId} {
        allow read, write: if isAuthenticated() && (
          get(/databases/$(database)/documents/documents/{documentId}).data.ownerId == request.auth.uid ||
          isAgentOrAdmin()
        );
      }
    }
  }
}`,
    vercelApiRoute: `// api/analyze.ts - Función Serverless para procesar uploads en Vercel
import { GoogleGenAI, Type } from "@google/genai";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import multiparty from "multiparty";
import fs from "fs";

// Inicializar el SDK de Gemini en el backend
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

export const config = {
  api: { bodyParser: false }, // Desactivamos el parser nativo para flujos grandes
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  // 1. Validar Token de Firebase Auth del Header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' });
  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // 2. Parsear el archivo multiparte (PDF, Imagen, CSV, etc.)
    const form = new multiparty.Form({ maxFilesSize: 15 * 1024 * 1024 }); // Límite de 15MB para Serverless
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ error: 'Error al parsear archivo', details: err.message });
      
      const file = files.document?.[0];
      if (!file) return res.status(400).json({ error: 'Archivo omitido' });

      const fileBuffer = fs.readFileSync(file.path);
      const base64Data = fileBuffer.toString('base64');
      const mimeType = file.headers['content-type'] || 'application/pdf';

      // 3. Consultar a Gemini 3.5 Flash para Análisis de Estructura y OCR de bajo nivel
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: "Extrae de forma analítica los datos del documento inmobiliario. Devuelve estrictamente un JSON que siga la estructura solicitada."
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              buyer: { type: Type.STRING },
              seller: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              surfaceArea: { type: Type.STRING },
              riskAlerts: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              }
            },
            required: ["summary", "buyer", "seller", "amount"]
          }
        }
      });

      const extractedData = JSON.parse(response.text);

      // 4. Guardar metadatos en Firestore
      const db = getFirestore();
      const docRef = await db.collection('documents').add({
        ownerId: userId,
        fileName: file.originalFilename,
        mimeType: mimeType,
        extractedData,
        uploadedAt: new Date().toISOString()
      });

      return res.status(200).json({ id: docRef.id, data: extractedData });
    });
  } catch (error) {
    return res.status(500).json({ error: 'Falla interna de procesamiento', message: error.message });
  }
}`,
    embeddingsCode: `// api/search.ts - Generación de Embeddings y Búsqueda Semántica
import { GoogleGenAI } from "@google/genai";
import { getFirestore } from "firebase-admin/firestore";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Generar Embedding para consulta del cliente
async function getEmbedding(text: string) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: text,
  });
  return response.embedding.values;
}

// Cálculo de similitud coseno entre dos vectores
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default async function searchDocuments(req, res) {
  const { query, documentId } = req.body;
  
  try {
    const queryVector = await getEmbedding(query);
    const db = getFirestore();
    
    // Obtener todos los fragmentos (chunks) guardados de este documento
    const chunksSnapshot = await db
      .collection('documents')
      .doc(documentId)
      .collection('chunks')
      .get();
      
    const results = [];
    chunksSnapshot.forEach(doc => {
      const chunkData = doc.data();
      const similarity = cosineSimilarity(queryVector, chunkData.vector);
      
      results.push({
        id: doc.id,
        text: chunkData.text,
        pageNumber: chunkData.pageNumber,
        score: similarity
      });
    });
    
    // Ordenar de mayor a menor relevancia
    results.sort((a, b) => b.score - a.score);
    
    // Retornar los top 3 fragmentos relevantes para alimentar la respuesta RAG de Gemini
    return res.status(200).json({ matches: results.slice(0, 3) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}`
  };

  const tabs = [
    { id: 'stack', label: 'Stack de Producción', icon: Layers },
    { id: 'flow', label: 'Flujo de Extracción', icon: Workflow },
    { id: 'firebase', label: 'Diseño Firebase', icon: Database },
    { id: 'vercel', label: 'Serverless Vercel', icon: Server },
    { id: 'semantic', label: 'Embeddings y RAG', icon: Search },
    { id: 'scale', label: 'Límites y Escala', icon: TrendingUp }
  ];

  return (
    <div className="bg-[#0e1117] text-gray-200 rounded-xl border border-gray-800 shadow-2xl overflow-hidden" id="architecture-container">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-[#141923] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="text-[#dfba73] h-6 w-6" />
            Planos Técnicos de la Arquitectura
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Diseño modular, seguro y autogestionado de nivel empresarial para el digestor inmobiliario.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-[#0c152d] text-[#ebd19c] border border-[#c4a470]/40 rounded-full px-3 py-1 self-start md:self-auto">
          <span className="w-2 h-2 bg-[#dfba73] rounded-full animate-pulse"></span>
          Esquema de Producción Validado
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-800 bg-[#0f131a] scrollbar-thin scrollbar-thumb-gray-800">
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap outline-none ${
                isActive 
                  ? 'border-[#c4a470] text-[#ebd19c] bg-[#142554]/20' 
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/20'
              }`}
              id={`tab-arch-${tab.id}`}
            >
              <IconComp className={`h-4 w-4 ${isActive ? 'text-[#ebd19c]' : 'text-gray-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="p-6 min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'stack' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
              key="stack-content"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Ecosistema Tecnológico de Extremo a Extremo</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      El stack combina procesamiento serverless en frontend y backend junto con almacenamiento no relacional optimizado para metadatos y vectores.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#141923] border border-gray-800">
                      <div className="text-[#ebd19c] font-medium text-sm flex items-center gap-1.5 mb-2">
                        <Code2 className="h-4 w-4" /> Frontend (Vercel)
                      </div>
                      <ul className="space-y-1.5 text-xs text-gray-300">
                        <li><strong className="text-white">React / Next.js SPA:</strong> Interfaz responsiva con renderizado dinámico e hidratación rápida.</li>
                        <li><strong className="text-white">Tailwind CSS:</strong> Sistema de diseño estructurado, adaptado con temas responsivos.</li>
                        <li><strong className="text-white">Framer Motion / Motion:</strong> Micro-interacciones de carga, transiciones fluidas de visualización de planos.</li>
                        <li><strong className="text-white">Lucide React:</strong> Librería de íconos estandarizada.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-[#141923] border border-gray-800">
                      <div className="text-[#ebd19c] font-medium text-sm flex items-center gap-1.5 mb-2">
                        <Server className="h-4 w-4" /> Backend Serverless (Vercel API)
                      </div>
                      <ul className="space-y-1.5 text-xs text-gray-300">
                        <li><strong className="text-white">Funciones Serverless en Node.js:</strong> API segura que expone los servicios de ingesta, OCR, embeddings e inferencia de chat.</li>
                        <li><strong className="text-white">Multiparty / Busboy:</strong> Parser optimizado en memoria para streams de archivos entrantes.</li>
                        <li><strong className="text-white">TypeScript Strict:</strong> Tipado sólido para la manipulación de cláusulas y alertas contractuales.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-[#141923] border border-gray-800">
                      <div className="text-[#ebd19c] font-medium text-sm flex items-center gap-1.5 mb-2">
                        <Database className="h-4 w-4" /> Base de Datos e Infra (Firebase)
                      </div>
                      <ul className="space-y-1.5 text-xs text-gray-300">
                        <li><strong className="text-white">Firebase Auth:</strong> Autenticación mediante Tokens JWT del lado del cliente.</li>
                        <li><strong className="text-white">Cloud Firestore:</strong> Base de datos de documentos JSON NoSQL para expedientes inmobiliarios.</li>
                        <li><strong className="text-white">Cloud Storage:</strong> Almacenamiento seguro de archivos crudos (PDFs escaneados e imágenes de planos).</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-[#141923] border border-gray-800">
                      <div className="text-[#ebd19c] font-medium text-sm flex items-center gap-1.5 mb-2">
                        <Cpu className="h-4 w-4" /> Inteligencia Artificial (Google GenAI)
                      </div>
                      <ul className="space-y-1.5 text-xs text-gray-300">
                        <li><strong className="text-white">Gemini 3.5 Flash:</strong> Procesamiento de PDFs nativos e imágenes de planos. Extrae texto, resume y estructura datos en un solo paso.</li>
                        <li><strong className="text-white">Gemini Embedding 2:</strong> Modelo de representación matemática para fragmentos de texto en búsquedas semánticas.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-lg bg-[#111520] border border-gray-800 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">¿Por qué este Stack?</h4>
                    <div className="space-y-3 text-xs text-gray-300">
                      <div className="flex gap-2">
                        <CheckCircle className="text-[#dfba73] h-4 w-4 shrink-0 mt-0.5" />
                        <p><strong className="text-white">Cero Servidores fijos:</strong> Escalabilidad elástica con facturación por uso real de Vercel + Firebase Spark/Blaze.</p>
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle className="text-[#dfba73] h-4 w-4 shrink-0 mt-0.5" />
                        <p><strong className="text-white">OCR Nativo Inteligente:</strong> Gemini 3.5 Flash reemplaza sistemas costosos de OCR (Tesseract / AWS Textract) con su ventana de contexto multimodal.</p>
                      </div>
                      <div className="flex gap-2">
                        <CheckCircle className="text-[#dfba73] h-4 w-4 shrink-0 mt-0.5" />
                        <p><strong className="text-white">Implementación Rápida:</strong> Se integra con el ecosistema inmobiliario heredado mediante llamadas API REST JSON estándar.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-400">
                    Garantiza un tiempo medio de desarrollo de prototipos de menos de 10 días útiles.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'flow' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
              key="flow-content"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">Flujo Ingestion, OCR Multimodal y Estructuración</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Descripción visual del pipeline técnico desde la carga de un archivo hasta su guardado vectorizado.
                </p>
              </div>

              {/* Diagrama de Flujo visual */}
              <div className="p-4 bg-[#141923] border border-gray-800 rounded-lg overflow-x-auto">
                <div className="min-w-[760px] flex justify-between items-center py-4">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center w-40 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-950 border border-blue-500 flex items-center justify-center text-blue-400 font-bold mb-2 shadow-lg shadow-blue-500/10">
                      01
                    </div>
                    <span className="text-xs font-semibold text-white">Carga Cliente</span>
                    <span className="text-[10px] text-gray-400 mt-1">Frontend valida tamaño y tipo (PDF, PNG)</span>
                  </div>

                  <div className="h-0.5 bg-gray-800 flex-1 mx-2 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-gray-600 rotate-45"></div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center w-40 text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-950 border border-amber-500 flex items-center justify-center text-amber-400 font-bold mb-2 shadow-lg shadow-amber-500/10">
                      02
                    </div>
                    <span className="text-xs font-semibold text-white">Vercel Proxy / Storage</span>
                    <span className="text-[10px] text-gray-400 mt-1">Guarda el archivo crudo en Firebase Storage</span>
                  </div>

                  <div className="h-0.5 bg-gray-800 flex-1 mx-2 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-gray-600 rotate-45"></div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center w-48 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#0c152d] border border-[#c4a470] flex items-center justify-center text-[#ebd19c] font-bold mb-2 shadow-lg shadow-[#c4a470]/10">
                      03
                    </div>
                    <span className="text-xs font-semibold text-white">Gemini 3.5 Flash</span>
                    <span className="text-[10px] text-gray-400 mt-1">OCR multimodal de alta fidelidad, extracción estructural JSON</span>
                  </div>

                  <div className="h-0.5 bg-gray-800 flex-1 mx-2 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-gray-600 rotate-45"></div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center w-40 text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-950 border border-purple-500 flex items-center justify-center text-purple-400 font-bold mb-2 shadow-lg shadow-purple-500/10">
                      04
                    </div>
                    <span className="text-xs font-semibold text-white">Guardado y Chunking</span>
                    <span className="text-[10px] text-gray-400 mt-1">Guarda en Firestore, calcula embeddings y almacena vectores</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Detalles del Pipeline Inmobiliario:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-300">
                  <div className="p-4 bg-[#111520] border border-gray-800 rounded-lg">
                    <h5 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#dfba73]"></span>
                      1. El Desafío del PDF Escaneado
                    </h5>
                    <p>
                      Muchos contratos e historiales notariales inmobiliarios son copias físicas fotocopiadas con sellos, firmas y distorsiones. La arquitectura utiliza <strong className="text-white">Gemini 3.5 Flash</strong> cargando directamente el archivo como <code className="text-[#dfba73]">inlineData</code>. Gemini descifra la tipografía, interpreta tablas legales complejas y maneja el plano visual en paralelo sin requerir segmentación manual del archivo.
                    </p>
                  </div>

                  <div className="p-4 bg-[#111520] border border-gray-800 rounded-lg">
                    <h5 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#dfba73]"></span>
                      2. Estructuración Forzada por Esquema (Schema)
                    </h5>
                    <p>
                      Para que la inmobiliaria pueda automatizar el ingreso en sus CRM de ventas, el motor AI no debe escupir texto libre. La configuración utiliza <strong className="text-white">responseSchema</strong> y <strong className="text-white">responseMimeType: "application/json"</strong> de la API de Gemini, obligando al modelo a entregar metadatos precisos: áreas en metros cuadrados numéricos, montos limpios y alertas críticas de riesgo clasificadas.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'firebase' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
              key="firebase-content"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Estructura e Integración de Firebase</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Esquema NoSQL jerárquico y Reglas de Seguridad estrictas para evitar fugas de contratos confidenciales.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(codeSnippets.firestoreRules, 'rules')}
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded flex items-center gap-1.5 transition-colors self-start md:self-auto"
                >
                  <Copy className="h-3 w-3" />
                  {copiedText === 'rules' ? '¡Copiado!' : 'Copiar Reglas'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4 text-xs">
                  <div className="p-4 bg-[#141923] border border-gray-800 rounded-lg">
                    <h4 className="font-semibold text-white mb-2 text-sm">Colecciones de Firestore</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="font-mono text-[#dfba73] font-semibold">/users</span>
                        <p className="text-gray-400 mt-0.5">Almacena roles (<code className="text-gray-300">"admin", "agent", "client"</code>) y perfiles del personal.</p>
                      </div>
                      <div>
                        <span className="font-mono text-[#dfba73] font-semibold">/documents</span>
                        <p className="text-gray-400 mt-0.5">Documento base. Contiene metadatos, liga al archivo original en Storage, fecha de firma, y el JSON extraído por la IA.</p>
                      </div>
                      <div>
                        <span className="font-mono text-[#dfba73] font-semibold">/documents/{"{docId}"}/chunks</span>
                        <p className="text-gray-400 mt-0.5">Subcolección de fragmentos para el RAG. Almacena bloques de texto de ~1,000 caracteres con su vector numérico correspondiente de 768 dimensiones.</p>
                      </div>
                      <div>
                        <span className="font-mono text-[#dfba73] font-semibold">/documents/{"{docId}"}/chats</span>
                        <p className="text-gray-400 mt-0.5">Subcolección para guardar el historial de preguntas y respuestas asociadas al documento.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#111520] border border-gray-800 rounded-lg">
                    <h4 className="font-semibold text-white mb-2 text-sm flex items-center gap-1">
                      <Lock className="h-4 w-4 text-amber-500" />
                      Estrategia de Seguridad
                    </h4>
                    <p className="text-gray-300 leading-relaxed">
                      Ningún cliente final debe ver las escrituras o contratos de otros clientes o propiedades que no sean suyos. Las reglas de seguridad de Firestore impiden lecturas masivas. Las peticiones validan el rol de <code className="text-[#dfba73]">agent</code> o <code className="text-[#dfba73]">admin</code> antes de otorgar acceso a expedientes globales.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="bg-[#0b0d13] border border-gray-800 rounded-lg overflow-hidden shadow-inner">
                    <div className="px-4 py-2.5 bg-[#141923] border-b border-gray-800 flex items-center justify-between">
                      <span className="font-mono text-xs text-[#dfba73] font-bold">firestore.rules</span>
                      <span className="text-[10px] text-gray-500">Reglas de Seguridad de Producción</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-gray-300 overflow-y-auto max-h-[350px] scrollbar-thin leading-relaxed">
                      {codeSnippets.firestoreRules}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'vercel' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
              key="vercel-content"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Funciones Serverless en Vercel</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Gestión eficiente del límite de tiempo (Timeout de 10s / 60s) en ejecuciones serverless al procesar archivos de gran tamaño.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(codeSnippets.vercelApiRoute, 'apiRoute')}
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded flex items-center gap-1.5 transition-colors self-start md:self-auto"
                >
                  <Copy className="h-3 w-3" />
                  {copiedText === 'apiRoute' ? '¡Copiado!' : 'Copiar API Endpoint'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <div className="bg-[#0b0d13] border border-gray-800 rounded-lg overflow-hidden shadow-inner">
                    <div className="px-4 py-2.5 bg-[#141923] border-b border-gray-800 flex items-center justify-between">
                      <span className="font-mono text-xs text-amber-400 font-bold">api/analyze.ts</span>
                      <span className="text-[10px] text-gray-500">Manejo de Cargas & Inferencia</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-gray-300 overflow-y-auto max-h-[350px] scrollbar-thin leading-relaxed">
                      {codeSnippets.vercelApiRoute}
                    </pre>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-4 text-xs">
                  <div className="p-4 bg-[#141923] border border-gray-800 rounded-lg space-y-3">
                    <h4 className="font-semibold text-white text-sm">Estrategia para Archivos de Gran Tamaño</h4>
                    <p className="text-gray-300">
                      Vercel tiene un límite estricto de cuerpo de petición de <strong className="text-white">4.5MB</strong> en su plan Hobby y <strong className="text-white">15MB</strong> en Pro. Para planos técnicos inmobiliarios de alta resolución que sobrepasan este tamaño, se recomienda el siguiente flujo:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-gray-400">
                      <li>El cliente solicita un <strong className="text-white">URL firmado de subida</strong> directo a Firebase Storage desde una función API de Vercel.</li>
                      <li>El cliente sube el archivo directo a Storage sin pasar por Vercel, evitando consumos de ancho de banda inútiles.</li>
                      <li>Se dispara un webhook o trigger en segundo plano para procesar el documento directamente en una cola asíncrona.</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-[#111520] border border-gray-800 rounded-lg space-y-2">
                    <h4 className="font-semibold text-white text-sm">Autenticación Segura</h4>
                    <p className="text-gray-300">
                      Para garantizar la protección de la información corporativa, los endpoints en Vercel descifran el encabezado de autorización usando <code className="text-gray-300">Firebase Admin SDK</code> de forma aislada, garantizando que ninguna solicitud no firmada consuma tokens de inferencia de Gemini.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'semantic' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
              key="semantic-content"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Embeddings y Recuperación Aumentada (RAG)</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Búsqueda semántica robusta en lenguaje natural mediante vectores matemáticos de bajo costo sin bases de datos adicionales.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(codeSnippets.embeddingsCode, 'embedCode')}
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded flex items-center gap-1.5 transition-colors self-start md:self-auto"
                >
                  <Copy className="h-3 w-3" />
                  {copiedText === 'embedCode' ? '¡Copiado!' : 'Copiar Código de Embeddings'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4 text-xs">
                  <div className="p-4 bg-[#141923] border border-gray-800 rounded-lg space-y-3">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                      <Search className="h-4 w-4 text-[#dfba73]" /> ¿Qué es RAG en este contexto?
                    </h4>
                    <p className="text-gray-300 leading-relaxed">
                      RAG (<em className="text-white">Retrieval-Augmented Generation</em>) permite chatear con escrituras de 100 páginas de manera económica. En lugar de enviar toda la escritura a la ventana de contexto de Gemini en cada pregunta (lo que incrementaría drásticamente los costos de tokens), hacemos lo siguiente:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                      <li>Dividimos el documento en fragmentos de texto (chunks) al crearlo.</li>
                      <li>Generamos un vector numérico (embedding) para cada fragmento.</li>
                      <li>Al hacer una pregunta, buscamos únicamente los 3 fragmentos con mayor <strong className="text-[#dfba73]">similitud coseno</strong>.</li>
                      <li>Inyectamos únicamente esos 3 fragmentos como contexto para Gemini.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#111520] border border-gray-800 rounded-lg">
                    <h4 className="font-semibold text-white mb-1.5 text-sm">Optimización de Modelo</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Usamos <strong className="text-white">gemini-embedding-2-preview</strong>. Tiene un desempeño sobresaliente en la compresión del vocabulario legal castellano, lo que reduce los falsos positivos en cláusulas de penalización o moras complejas.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="bg-[#0b0d13] border border-gray-800 rounded-lg overflow-hidden shadow-inner">
                    <div className="px-4 py-2.5 bg-[#141923] border-b border-gray-800 flex items-center justify-between">
                      <span className="font-mono text-xs text-blue-400 font-bold">api/search.ts</span>
                      <span className="text-[10px] text-gray-500">Similitud Coseno e Integración</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-gray-300 overflow-y-auto max-h-[350px] scrollbar-thin leading-relaxed">
                      {codeSnippets.embeddingsCode}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'scale' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
              key="scale-content"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">Consideraciones de Escala, Costos y Límites</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Cómo mitigar las limitaciones de las plataformas serverless para garantizar una alta disponibilidad de cara al cliente final.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-5 bg-[#141923] border border-gray-800 rounded-xl space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-red-950/40 text-red-400 border border-red-800/60 flex items-center justify-center font-bold text-sm">
                    10s
                  </div>
                  <h4 className="text-sm font-semibold text-white">Límite de Tiempo de Vercel</h4>
                  <p className="text-gray-300 leading-relaxed">
                    Las funciones serverless gratuitas de Vercel tienen un límite de ejecución estricto de <strong className="text-white">10 segundos</strong> (60s en plan Pro). El procesamiento multimodal de un PDF de varias páginas escaneadas con Gemini puede tardar entre <strong className="text-white">8 y 15 segundos</strong>.
                  </p>
                  <div className="pt-2 border-t border-gray-800 text-gray-400 font-semibold">
                    Solución: Procesar el archivo asíncronamente devolviendo un ticket de estado ("processing") de inmediato, o usar SSE (Server-Sent Events) para ir reportando etapas de forma fluida.
                  </div>
                </div>

                <div className="p-5 bg-[#141923] border border-gray-800 rounded-xl space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/60 flex items-center justify-center font-bold text-sm">
                    $0.0
                  </div>
                  <h4 className="text-sm font-semibold text-white">Optimización de Costos de Token</h4>
                  <p className="text-gray-300 leading-relaxed">
                    Escribir un prompt excesivamente largo en cada pregunta de chat acumula costos. Gemini 3.5 Flash cobra una fracción de centavo por cada 1,000 tokens de entrada, pero en escala puede notarse.
                  </p>
                  <div className="pt-2 border-t border-gray-800 text-gray-400 font-semibold">
                    Solución: Implementar almacenamiento en caché del contexto del documento (<strong className="text-white">Context Caching</strong> de Gemini) para escrituras de más de 32,000 tokens, lo que reduce el costo de lectura recurrente en un 50%.
                  </div>
                </div>

                <div className="p-5 bg-[#141923] border border-gray-800 rounded-xl space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900/60 text-slate-300 border border-slate-700/50 flex items-center justify-center font-bold text-sm">
                    99.9%
                  </div>
                  <h4 className="text-sm font-semibold text-white">Límites de Firestore</h4>
                  <p className="text-gray-300 leading-relaxed">
                    Firestore maneja millones de lecturas sin inmutarse, pero requiere índices compuestos si quieres filtrar documentos por dirección, fecha de firma y monto al mismo tiempo.
                  </p>
                  <div className="pt-2 border-t border-gray-800 text-gray-400 font-semibold">
                    Solución: Declarar los índices compuestos requeridos en el archivo <code className="text-gray-300">firestore.indexes.json</code> de la infraestructura para prevenir fallas de consulta en dashboards inmobiliarios avanzados.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
