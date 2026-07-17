import React from 'react';
import { 
  Compass, 
  HelpCircle, 
  Moon, 
  Sparkles,
} from 'lucide-react';
import DocumentDigester from './components/DocumentDigester';

export default function App() {
  return (
    <div className="min-h-screen bg-[#090b11] text-gray-100 flex flex-col font-sans transition-colors duration-300">
      {/* Header / Top Navigation Bar */}
      <header className="bg-[#0e111a] border-b border-gray-800/80 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/images/logo.png"
              alt="INVERLAND — Soluciones Inmobiliarias"
              className="h-10 sm:h-12 w-auto object-contain select-none"
              draggable={false}
            />
            <span className="hidden sm:inline-flex text-[9px] bg-[#0c152d] text-[#ebd19c] font-mono font-bold px-2 py-0.5 rounded border border-[#c4a470]/40 uppercase tracking-wider shrink-0">
              IA v3.5
            </span>
          </div>

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
          </div>
        </div>

        <DocumentDigester />

      </main>

      {/* Footer */}
      <footer className="bg-[#01030a] border-t border-[#c4a470]/20 py-6 mt-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="INVERLAND"
              className="h-8 w-auto object-contain opacity-90"
              draggable={false}
            />
            <p>© 2026 INVERLAND Desarrollos. Portal de Auditoría de Documentos de Consulta Interna.</p>
          </div>
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
