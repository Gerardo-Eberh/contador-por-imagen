
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ImageProcessor from './components/ImageProcessor';
import LiveProcessor from './components/LiveProcessor';
import { AppMode, HistoryEntry } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.UPLOAD);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zoocount_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading history", e);
      }
    }
  }, []);

  const addHistoryEntry = (entry: HistoryEntry) => {
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 20); // Keep last 20
      localStorage.setItem('zoocount_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem('zoocount_history');
    setHistory([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <Header currentMode={mode} setMode={setMode} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {mode === AppMode.UPLOAD && (
          <ImageProcessor onNewHistoryEntry={addHistoryEntry} />
        )}

        {mode === AppMode.LIVE && (
          <LiveProcessor onNewHistoryEntry={addHistoryEntry} />
        )}

        {mode === AppMode.HISTORY && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Historial de Conteo</h2>
                <p className="text-slate-400">Tus últimos análisis guardados localmente.</p>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-slate-400 hover:text-red-400 text-sm flex items-center gap-2 transition-colors"
                >
                  <i className="fas fa-trash-alt"></i> Borrar Todo
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="bg-slate-800 rounded-3xl p-12 text-center border border-slate-700">
                <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                  <i className="fas fa-folder-open text-3xl"></i>
                </div>
                <p className="text-slate-400 text-lg">No hay registros aún.</p>
                <button 
                  onClick={() => setMode(AppMode.UPLOAD)}
                  className="mt-4 text-emerald-400 hover:underline font-medium"
                >
                  Comienza subiendo una imagen
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {history.map((entry) => (
                  <div key={entry.id} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-all hover:-translate-y-1 shadow-lg flex flex-col">
                    <div className="aspect-video w-full overflow-hidden bg-slate-950 relative">
                      <img src={entry.imageUrl} alt="Análisis" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {entry.result.totalCount} {entry.result.totalCount === 1 ? 'Cabeza' : 'Cabezas'}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="text-slate-500 text-[10px] uppercase font-bold mb-2">
                        {new Date(entry.timestamp).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      <h3 className="font-bold text-slate-200 line-clamp-1 mb-2">
                        {entry.result.summary}
                      </h3>
                      <div className="mt-auto flex flex-wrap gap-1">
                        {entry.result.detections.slice(0, 3).map((d, i) => (
                          <span key={i} className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600">
                            {d.species}
                          </span>
                        ))}
                        {entry.result.detections.length > 3 && (
                          <span className="text-[9px] text-slate-500">+{entry.result.detections.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Powered by <span className="text-emerald-400 font-semibold">Gemini AI</span> &middot; Diseñado para precisión en agricultura y fauna
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
