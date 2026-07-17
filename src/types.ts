export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO or local date/time string
  userEmail: string; // User who processed the document
  action: string; // Action type (e.g. Carga y Análisis, Generación de Reporte)
  documentId: string;
  documentName: string;
  documentCategory: string;
  summary: string; // Short or full executive summary of the document/action
}

export interface RealEstateDocument {
  id: string;
  name: string;
  type: 'pdf_native' | 'pdf_scanned' | 'txt' | 'csv' | 'xlsx' | 'image';
  category: 'escritura' | 'contrato' | 'plano' | 'factura' | 'otro';
  size: string;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploadProgress?: number;
  currentStepText?: string;
  content?: string; // Text content or Base64 representation
  mimeType?: string;
  analysis?: DocumentAnalysis;
}

export interface CriticalDeadline {
  title: string;
  date: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface DocumentAnalysis {
  summary: string;
  legalRiskSummary?: string; // Resumen ejecutivo detallado de riesgos legales
  criticalDeadlines?: CriticalDeadline[]; // Fechas y plazos críticos extraídos del documento
  entities: {
    buyerOrTenant?: string;
    sellerOrLandlord?: string;
    notary?: string;
    propertyAddress?: string;
    cadastralKey?: string; // Clave catastral
  };
  metrics: {
    surfaceArea?: string; // Superficie m²
    transactionAmount?: string; // Monto
    currency?: string;
    duration?: string; // Plazo
  };
  dates: {
    signingDate?: string;
    expirationDate?: string;
    registrationDate?: string;
  };
  keyClauses: Array<{
    title: string;
    summary: string;
    risk: 'low' | 'medium' | 'high';
    riskExplanation: string;
  }>;
  alerts: Array<{
    type: 'critical' | 'warning' | 'info';
    message: string;
  }>;
  ocrExtracted: boolean;
  ocrMethodUsed?: string;
  extractedText?: string; // Transcripción o texto OCR completo
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ArchitectureSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  techStack: string[];
  codeSnippet: string;
  codeLanguage: string;
  keyPoints: string[];
}

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'loading';
  timestamp: string;
  isRead: boolean;
  progress?: number;
}

