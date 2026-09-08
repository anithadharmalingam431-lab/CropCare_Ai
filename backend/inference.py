"""
Model inference module.
Handles loading the trained CNN model and running predictions on
preprocessed images. Kept separate from API logic so the model can be
swapped or retrained without touching the server.
"""

import numpy as np

from config import DISEASE_CLASSES, LOW_CONFIDENCE_THRESHOLD, MODEL_PATH
from model import build_model, load_model
from disease_info import get_disease_info


class ModelManager:
    """
    Manages the CNN model lifecycle — lazy loading, prediction, and
    confidence-based status determination.
    """

    def __init__(self):
        self._model = None
        self._loaded = False

    def load(self) -> None:
        """Load the trained model from disk, or build a fresh one if no weights exist."""
        trained = load_model(MODEL_PATH)
        if trained is not None:
            self._model = trained
        else:
            # No trained weights yet — build the architecture so the API
            # still works (predictions will be low-confidence until trained).
            self._model = build_model()
        self._loaded = True

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def predict(self, preprocessed_image: np.ndarray) -> dict:
        """
        Run the model on a preprocessed image and return prediction results.

        Args:
            preprocessed_image: 4D numpy array from preprocessing.preprocess_image().

        Returns:
            Dict with: class_index, class_name, confidence, status,
            crop, disease, description, symptoms, recommendation, warning.
        """
        if not self._loaded:
            self.load()

        predictions = self._model.predict(preprocessed_image, verbose=0)
        class_index = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]) * 100)
        class_name = DISEASE_CLASSES[class_index]
        info = get_disease_info(class_name)

        status = info["status"]
        warning = None

        if confidence < LOW_CONFIDENCE_THRESHOLD:
            warning = (
                "Low confidence prediction. The image may be unclear or the "
                "disease may not match known patterns. Consider consulting an "
                "agricultural expert."
            )

        return {
            "crop": info["crop"],
            "disease": info["disease"],
            "confidence": round(confidence, 1),
            "status": status,
            "description": info["description"],
            "symptoms": info["symptoms"],
            "recommendation": info["recommendation"],
            "warning": warning,
        }


# Singleton instance
model_manager = ModelManager()
