
import React, { useRef, useEffect } from 'react';
import { Detection } from '../types';

interface DetectionDisplayProps {
  imageUrl: string;
  detections: Detection[];
  isLoading?: boolean;
}

const DetectionDisplay: React.FC<DetectionDisplayProps> = ({ imageUrl, detections, isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const drawBoxes = () => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img || !img.complete) return;

      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      detections.forEach((det) => {
        const [ymin, xmin, ymax, xmax] = det.box_2d;
        
        // Gemini returns normalized 0-1000
        const top = (ymin / 1000) * canvas.height;
        const left = (xmin / 1000) * canvas.width;
        const width = ((xmax - xmin) / 1000) * canvas.width;
        const height = ((ymax - ymin) / 1000) * canvas.height;

        // Draw box
        ctx.strokeStyle = '#10b981'; // Emerald 500
        ctx.lineWidth = 3;
        ctx.strokeRect(left, top, width, height);

        // Draw label background
        ctx.fillStyle = '#10b981';
        const labelText = `${det.species}`;
        ctx.font = '12px Inter, sans-serif';
        const labelWidth = ctx.measureText(labelText).width;
        ctx.fillRect(left, top - 20, labelWidth + 10, 20);

        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, left + 5, top - 6);
      });
    };

    const handleResize = () => drawBoxes();
    window.addEventListener('resize', handleResize);
    
    // Draw once image loads
    if (imgRef.current) {
      imgRef.current.onload = drawBoxes;
    }
    drawBoxes();

    return () => window.removeEventListener('resize', handleResize);
  }, [imageUrl, detections]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl group" ref={containerRef}>
      <img 
        ref={imgRef}
        src={imageUrl} 
        alt="Detección de animales" 
        className={`w-full h-auto block transition-all duration-500 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`}
      />
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-400 font-medium animate-pulse">Analizando cabezas con IA...</p>
        </div>
      )}
      
      {!isLoading && detections.length > 0 && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg animate-bounce">
          {detections.length} {detections.length === 1 ? 'Cabeza' : 'Cabezas'} detectadas
        </div>
      )}
    </div>
  );
};

export default DetectionDisplay;
