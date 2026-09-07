import { API_URL } from "./supabase";
import type { PredictionResult } from "../types";

export async function predictDisease(imageFile: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = "Analysis failed. Please try again.";
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorMessage;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.crop || !data.disease || data.confidence === undefined) {
    throw new Error("Received an invalid response from the analysis service.");
  }

  return data as PredictionResult;
}

export async function savePrediction(
  result: PredictionResult,
  imageUrl: string | null
): Promise<void> {
  const response = await fetch(`${API_URL}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      crop: result.crop,
      disease: result.disease,
      confidence: result.confidence,
      status: result.status,
      image_url: imageUrl,
      description: result.description,
      symptoms: result.symptoms,
      recommendation: result.recommendation,
    }),
  });

  if (!response.ok) {
    // Non-fatal — prediction still displayed, just not saved to history
    console.warn("Failed to save prediction to history");
  }
}
