import React, { useState } from 'react';
import { 
  Building, 
  Layers, 
  Compass, 
  HelpCircle, 
  Moon, 
  FileCheck2,
  Sparkles,
  Zap
} from 'lucide-react';
import ArchitectureView from './components/ArchitectureView';
import DocumentDigester from './components/DocumentDigester';

export default function App() {
  const [activeTab, setActiveTab] = useState<'digester' | 'architecture'>('digester');

  return (
    <div className="min-h-screen bg-[#090b11] text-gray-100 flex flex-col font-sans transition-colors duration-300">
      {/* Header / Top Navigation Bar */}
      <header className="bg-[#0e111a] border-b border-gray-800/80 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            {/* Symmetrical Elegant Golden Crest Logo for Inverland */}
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-[#0c152d] to-[#142554] border border-[#c4a470]/40 flex items-center justify-center shadow-lg shadow-[#02040a]/80 relative overflow-hidden shrink-0">
              <svg className="h-7 w-7 text-[#dfba73] drop-shadow-[0_0_8px_rgba(196,164,112,0.4)]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DFBA73" />
                    <stop offset="50%" stopColor="#C4A470" />
                    <stop offset="100%" stopColor="#BA9868" />
                  </linearGradient>
                </defs>
                {/* Geometrical crest with stylized "I" and mountain peaks representing real estate land */}
                <path d="M50 15 L82 65 L70 65 L50 35 L30 65 L18 65 Z" fill="url(#gold-gradient)" />
                <path d="M50 45 L62 65 L50 85 L38 65 Z" fill="url(#gold-gradient)" opacity="0.85" />
                <circle cx="50" cy="50" r="44" stroke="url(#gold-gradient)" strokeWidth="2" strokeDasharray="3 3" opacity="0.25" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-base font-bold tracking-widest text-white">INVERLAND</span>
                <span className="text-[9px] bg-[#0c152d] text-[#ebd19c] font-mono font-bold px-2 py-0.5 rounded border border-[#c4a470]/40 uppercase tracking-wider">
                  IA v3.5
                </span>
              </div>
              <p className="text-[9px] text-[#ebd19c]/80 uppercase tracking-widest font-semibold font-sans">DESARROLLOS • DIGESTOR IA</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 bg-[#121622] p-1 rounded-lg border border-gray-800">
            <button
              onClick={() => setActiveTab('digester')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all outline-none ${
                activeTab === 'digester'
                  ? 'bg-[#c4a470] text-[#02040a] shadow-sm font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              id="nav-tab-digester"
            >
              <Zap className="h-3.5 w-3.5" />
              Demo Interactiva
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all outline-none ${
                activeTab === 'architecture'
                  ? 'bg-[#c4a470] text-[#02040a] shadow-sm font-bold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              id="nav-tab-architecture"
            >
              <Layers className="h-3.5 w-3.5" />
              Arquitectura Técnica
            </button>
          </nav>

          {/* Right Status Panel */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121622] rounded-lg border border-gray-800 text-xs">
              <Moon className="h-3.5 w-3.5 text-[#dfba73]" />
              <span className="text-gray-400 font-semibold">Modo Oscuro</span>
              <span className="text-[10px] text-[#dfba73] font-bold bg-[#0c152d] px-1.5 py-0.5 rounded uppercase">Activado</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#050d24] to-[#142554] rounded-2xl border border-[#c4a470]/30 shadow-lg relative overflow-hidden gold-border-glow">
          {/* Decorative Glowing Blur Circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c4a470]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#142554]/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-1.5">
            <h1 className="text-xl md:text-2xl font-cinzel font-bold text-white flex items-center gap-2 tracking-wide">
              <Sparkles className="text-[#dfba73] h-5 w-5 shrink-0 animate-pulse" />
              Portal de Auditoría Legal e Inmobiliaria
            </h1>
            <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-2xl">
              Plataforma interna de <span className="text-[#ebd19c] font-semibold">INVERLAND Desarrollos</span> para la validación automática de escrituras públicas, contratos civiles y planos topográficos. Audita linderos, identifica riesgos contractuales y consulta tus expedientes con IA en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <span className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg bg-gray-900/60 border border-[#c4a470]/30 text-[#dfba73] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfba73] animate-ping"></span>
              INVERLAND CORP
            </span>
            <span className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg bg-gray-900/60 border border-[#c4a470]/30 text-[#ebd19c] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dfba73]"></span>
              Soporte Gemini 3.5
            </span>
          </div>
        </div>

        {/* Tab Content rendering */}
        <div className="transition-all duration-300">
          {activeTab === 'digester' ? (
            <DocumentDigester />
          ) : (
            <ArchitectureView />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#01030a] border-t border-[#c4a470]/20 py-6 mt-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 INVERLAND Desarrollos. Portal de Auditoría de Documentos de Consulta Interna.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 hover:text-[#dfba73] cursor-pointer transition-colors">
              <Compass className="h-3.5 w-3.5 text-[#c4a470]" /> Guías Legales
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#dfba73] cursor-pointer transition-colors">
              <HelpCircle className="h-3.5 w-3.5 text-[#c4a470]" /> Soporte Corporativo
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
