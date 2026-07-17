export interface RealEstateDocument {
  id: string;
  name: string;
  type: 'pdf_native' | 'pdf_scanned' | 'txt' | 'csv' | 'xlsx' | 'image';
  category: 'escritura' | 'contrato' | 'plano' | 'factura' | 'otro';
  size: string;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  content?: string; // Text content or Base64 representation
  mimeType?: string;
  analysis?: DocumentAnalysis;
}

export interface DocumentAnalysis {
  summary: string;
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
