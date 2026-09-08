"""
Configuration for CropCare AI backend.
Centralizes model parameters, class names, and paths.
"""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "crop_disease_model.h5")
DB_PATH = os.path.join(BASE_DIR, "database", "cropcare.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

IMG_SIZE = 128
INPUT_SHAPE = (IMG_SIZE, IMG_SIZE, 3)

DISEASE_CLASSES = [
    "Healthy",
    "Early Blight",
    "Late Blight",
    "Leaf Spot",
    "Rust",
    "Powdery Mildew",
]

NUM_CLASSES = len(DISEASE_CLASSES)

LOW_CONFIDENCE_THRESHOLD = 50.0

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
