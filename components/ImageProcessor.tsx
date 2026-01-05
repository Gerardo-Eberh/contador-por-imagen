
import React, { useState, useRef } from 'react';
import { analyzeAnimalHeads } from '../services/geminiService';
import { DetectionResult, HistoryEntry } from '../types';
import DetectionDisplay from './DetectionDisplay';

interface ImageProcessorProps {
  onNewHistoryEntry: (entry: HistoryEntry) => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ onNewHistoryEntry }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const previewUrl = reader.result as string;
      setSelectedImage(previewUrl);
      
      setLoading(true);
      try {
        const data = await analyzeAnimalHeads(base64);
        setResult(data);
        
        // Add to history
        onNewHistoryEntry({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          imageUrl: previewUrl,
          result: data
        });
      } catch (err: any) {
        setError(err.message || 'Error al procesar la imagen');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h2 className="text-xl font-semibold mb-2">Conteo por Foto</h2>
        <p className="text-slate-400 text-sm mb-6">Sube una imagen o toma una fotografía para que la IA identifique y cuente las cabezas de los animales automáticamente.</p>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-cloud-upload-alt text-2xl text-slate-400 group-hover:text-emerald-400"></i>
          </div>
          <p className="font-medium text-slate-200">Click para seleccionar o arrastra una imagen</p>
          <p className="text-xs text-slate-500 mt-2">JPG, PNG o WEBP (Max 5MB)</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <i className="fas fa-exclamation-circle text-xl"></i>
          <span>{error}</span>
        </div>
      )}

      {selectedImage && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <DetectionDisplay 
              imageUrl={selectedImage} 
              detections={result?.detections || []} 
              isLoading={loading} 
            />
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 h-full">
              <h3 className="text-lg font-bold mb-4 text-emerald-400 flex items-center gap-2">
                <i className="fas fa-chart-pie"></i> Resultados
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-slate-700/50 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Total Detectados</p>
                    <p className="text-4xl font-bold text-white">{result.totalCount}</p>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Resumen IA</p>
                    <p className="text-sm text-slate-300 italic">"{result.summary}"</p>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {result.detections.map((det, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">#{idx + 1}</span>
                          <span className="text-sm font-medium">{det.species}</span>
                        </div>
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                          {Math.round(det.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-12">No hay resultados disponibles</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageProcessor;
