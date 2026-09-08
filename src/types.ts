export interface PredictionResult {
  crop: string;
  disease: string;
  confidence: number;
  status: "Healthy" | "Diseased";
  description: string;
  symptoms: string[];
  recommendation: string[];
  warning?: string | null;
  reference_image?: string | null;
}

export interface PredictionRecord {
  id: string | number;
  crop: string;
  disease: string;
  confidence: number;
  status: string;
  image_url?: string | null;
  image_path?: string | null;
  description: string | null;
  symptoms: string[] | null;
  recommendation: string[] | null;
  created_at: string;
}
