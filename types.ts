
export interface Detection {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  label: string;
  species: string;
  confidence: number;
}

export interface DetectionResult {
  totalCount: number;
  detections: Detection[];
  summary: string;
}

export enum AppMode {
  UPLOAD = 'UPLOAD',
  LIVE = 'LIVE',
  HISTORY = 'HISTORY'
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  imageUrl: string;
  result: DetectionResult;
}
