
import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, setMode }) => {
  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <i className="fas fa-paw text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              ZooCount Pro
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-tighter">Ultra Sensitivity Active</span>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl">
          <button 
            onClick={() => setMode(AppMode.UPLOAD)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentMode === AppMode.UPLOAD ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fas fa-upload mr-2"></i> Subir Imagen
          </button>
          <button 
            onClick={() => setMode(AppMode.LIVE)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentMode === AppMode.LIVE ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fas fa-video mr-2"></i> En Vivo
          </button>
          <button 
            onClick={() => setMode(AppMode.HISTORY)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentMode === AppMode.HISTORY ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <i className="fas fa-history mr-2"></i> Historial
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right mr-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Motor IA</p>
            <p className="text-xs text-emerald-400 font-mono">Gemini 3 Pro</p>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-cog text-xl"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
