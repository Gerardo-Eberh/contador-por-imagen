
import React, { useRef, useState, useEffect } from 'react';
import { analyzeAnimalHeads } from '../services/geminiService';
import { DetectionResult, HistoryEntry } from '../types';
import DetectionDisplay from './DetectionDisplay';

interface LiveProcessorProps {
  onNewHistoryEntry: (entry: HistoryEntry) => void;
}

const LiveProcessor: React.FC<LiveProcessorProps> = ({ onNewHistoryEntry }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCapture, setLastCapture] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError("No se pudo acceder a la cámara. Por favor asegúrate de dar los permisos necesarios.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || isAnalyzing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = dataUrl.split(',')[1];

    setLastCapture(dataUrl);
    setIsAnalyzing(true);

    try {
      const result = await analyzeAnimalHeads(base64);
      setCurrentResult(result);
      
      onNewHistoryEntry({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageUrl: dataUrl,
        result: result
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-xl relative aspect-video flex items-center justify-center bg-black">
          {!isStreaming ? (
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-video-slash text-3xl text-slate-500"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Cámara Desactivada</h3>
              <button 
                onClick={startCamera}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:scale-105"
              >
                Activar Cámara En Vivo
              </button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border border-white/20">
                  Live Stream
                </span>
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <button 
                  onClick={captureAndAnalyze}
                  disabled={isAnalyzing}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group"
                >
                  {isAnalyzing ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <i className="fas fa-camera text-2xl"></i>
                  )}
                </button>
                <button 
                  onClick={stopCamera}
                  className="bg-white/10 hover:bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
                >
                  <i className="fas fa-stop"></i>
                </button>
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl flex items-center gap-3">
            <i className="fas fa-exclamation-circle text-xl"></i>
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 h-full min-h-[400px]">
          <h3 className="text-lg font-bold mb-6 text-emerald-400 flex items-center gap-2">
            <i className="fas fa-microchip"></i> Última Captura Analizada
          </h3>
          
          {lastCapture ? (
            <div className="space-y-6">
              <DetectionDisplay 
                imageUrl={lastCapture} 
                detections={currentResult?.detections || []} 
                isLoading={isAnalyzing} 
              />
              
              {!isAnalyzing && currentResult && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Recuento</p>
                    <p className="text-3xl font-bold">{currentResult.totalCount}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Confianza Promedio</p>
                    <p className="text-3xl font-bold">
                      {Math.round(currentResult.detections.reduce((a, b) => a + b.confidence, 0) / (currentResult.detections.length || 1) * 100)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500 text-center">
              <i className="fas fa-bolt text-4xl mb-4 opacity-20"></i>
              <p>Presiona el botón de la cámara para capturar y analizar un fotograma en tiempo real.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveProcessor;
