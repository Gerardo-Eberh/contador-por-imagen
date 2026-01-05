
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DetectionResult } from "../types";

// Inicializamos el cliente. Se recomienda Gemini 3 Pro para tareas de alta precisión visual.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DETECTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    totalCount: {
      type: Type.INTEGER,
      description: "Número total exacto de cabezas de animales detectadas."
    },
    detections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          box_2d: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "Coordenadas [ymin, xmin, ymax, xmax] de la cabeza (0-1000)."
          },
          label: { type: Type.STRING, description: "Etiqueta de la cabeza detectada." },
          species: { type: Type.STRING, description: "Especie identificada." },
          confidence: { type: Type.NUMBER, description: "Nivel de confianza de 0 a 1." }
        },
        required: ["box_2d", "label", "species", "confidence"]
      }
    },
    summary: {
      type: Type.STRING,
      description: "Resumen técnico del análisis (ej. 'Detección exhaustiva en zona de alta densidad')."
    }
  },
  required: ["totalCount", "detections", "summary"]
};

export const analyzeAnimalHeads = async (base64Image: string): Promise<DetectionResult> => {
  // Usamos gemini-3-pro-preview para mayor sensibilidad y precisión en detalles pequeños
  const modelName = 'gemini-3-pro-preview';
  
  const systemInstruction = `Eres un experto en visión artificial para agricultura y fauna. 
  Tu misión es realizar un conteo INDIVIDUAL Y EXHAUSTIVO de cada animal presente basándote ÚNICAMENTE en sus cabezas.
  
  REGLAS DE ORO PARA PRECISIÓN MÁXIMA:
  1. Detecta cabezas incluso si son muy pequeñas (lejanas) o están parcialmente ocultas por otros animales.
  2. Si hay una multitud, analiza los patrones de orejas, ojos y hocicos para separar individuos.
  3. No ignores animales en los bordes de la imagen.
  4. Sé extremadamente meticuloso: es preferible tardar más pero no omitir ningún individuo.`;

  const prompt = `Analiza detalladamente esta imagen. Identifica y localiza la CABEZA de cada animal.
  Proporciona las cajas delimitadoras precisas [ymin, xmin, ymax, xmax] para cada cabeza.
  Cuenta cada una de ellas con cuidado para asegurar que el 'totalCount' sea exacto.
  Responde estrictamente en formato JSON.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: DETECTION_SCHEMA,
      // Activamos el pensamiento profundo para mejorar la detección en escenas complejas
      thinkingConfig: { thinkingBudget: 4000 } 
    }
  });

  const text = response.text;
  if (!text) throw new Error("La IA no devolvió datos de análisis.");
  
  try {
    return JSON.parse(text) as DetectionResult;
  } catch (e) {
    console.error("Error parseando JSON de Gemini:", text);
    throw new Error("Error en la estructura de datos devuelta por la IA.");
  }
};
