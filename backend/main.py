"""
FastAPI application for CropCare AI — AI-Based Crop Disease Detection System.

Endpoints:
  GET  /health    — Check server status and model readiness.
  GET  /diseases   — List all supported disease classes with info.
  POST /predict   — Analyze a leaf image and return disease prediction.
  POST /history   — Store a prediction record.
  GET  /history    — Retrieve all stored prediction records.

The model loading is separate from the API logic (see model.py and inference.py)
so the model can be replaced or retrained without touching this file.
"""

import os

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import json

from config import (
    DISEASE_CLASSES,
    MAX_FILE_SIZE,
    UPLOAD_DIR,
)
from database import init_db, save_prediction, get_all_predictions
from disease_info import DISEASE_INFO
from inference import model_manager
from preprocessing import preprocess_image, validate_image_file

# ─── App setup ────────────────────────────────────────────────────────────

app = FastAPI(
    title="CropCare AI API",
    description="AI-Based Crop Disease Detection System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.on_event("startup")
async def startup():
    """Initialize database and load model on server start."""
    init_db()
    model_manager.load()


# ─── Pydantic models for /history POST ────────────────────────────────────

class HistoryItem(BaseModel):
    crop: str
    disease: str
    confidence: float
    status: str
    image_path: Optional[str] = None
    description: Optional[str] = None
    symptoms: Optional[list] = None
    recommendation: Optional[list] = None


# ─── Endpoints ────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Check whether the backend server is running and the model is loaded."""
    return {
        "status": "healthy",
        "model_loaded": model_manager.is_loaded,
        "classes": DISEASE_CLASSES,
    }


@app.get("/diseases")
async def diseases():
    """Return all available crop diseases and their basic information."""
    result = []
    for i, class_name in enumerate(DISEASE_CLASSES):
        info = DISEASE_INFO[class_name]
        result.append(
            {
                "id": i,
                "name": class_name,
                "crop": info["crop"],
                "disease": info["disease"],
                "status": info["status"],
                "description": info["description"],
                "symptoms": info["symptoms"],
                "recommendation": info["recommendation"],
            }
        )
    return {"diseases": result}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Receive a crop leaf image, preprocess it, run it through the CNN model,
    and return the disease prediction with confidence score and recommendations.
    """
    content = await file.read()

    # Validate
    try:
        validate_image_file(file.filename or "", content, MAX_FILE_SIZE)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Preprocess
    try:
        preprocessed = preprocess_image(content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # Predict
    try:
        result = model_manager.predict(preprocessed)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model analysis failed: {exc}")

    return result


@app.post("/history")
async def add_history(item: HistoryItem):
    """Store a prediction history record in the database."""
    try:
        record = save_prediction(
            crop=item.crop,
            disease=item.disease,
            confidence=item.confidence,
            status=item.status,
            image_path=item.image_path,
            description=item.description,
            symptoms=item.symptoms,
            recommendation=item.recommendation,
        )
        return {"success": True, "prediction": record}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save history: {exc}")


@app.get("/history")
async def get_history():
    """Retrieve all previous prediction results, newest first."""
    try:
        records = get_all_predictions(limit=100)
        return {"predictions": records}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {exc}")


# ─── Run ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
