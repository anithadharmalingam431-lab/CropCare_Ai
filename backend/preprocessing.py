"""
Image preprocessing pipeline for crop disease detection.
Uses OpenCV, NumPy, and Pillow to prepare leaf images for the CNN model.

Steps:
  1. Open the image with Pillow and convert to RGB.
  2. Resize to the model's expected input size.
  3. Convert to a NumPy array via OpenCV.
  4. Normalize pixel values to [0, 1].
  5. Add batch dimension for model input.
"""

import io

import cv2
import numpy as np
from PIL import Image

from config import IMG_SIZE


def preprocess_image(file_bytes: bytes, target_size: int = None) -> np.ndarray:
    """
    Preprocess raw image bytes for model prediction.

    Args:
        file_bytes: Raw image file content as bytes.
        target_size: Target dimension (square). Defaults to config IMG_SIZE.

    Returns:
        A 4D numpy array of shape (1, target_size, target_size, 3) with
        float32 values normalized to [0, 1].

    Raises:
        ValueError: If the image cannot be opened or decoded.
    """
    if target_size is None:
        target_size = IMG_SIZE

    try:
        image = Image.open(io.BytesIO(file_bytes))
    except Exception as exc:
        raise ValueError(f"Cannot open image: {exc}") from exc

    image = image.convert("RGB")

    img_array = np.array(image)

    # Resize using OpenCV for consistent quality
    img_array = cv2.resize(img_array, (target_size, target_size), interpolation=cv2.INTER_AREA)

    # Normalize to [0, 1]
    img_array = img_array.astype(np.float32) / 255.0

    # Add batch dimension: (H, W, C) -> (1, H, W, C)
    img_array = np.expand_dims(img_array, axis=0)

    return img_array


def validate_image_file(filename: str, content: bytes, max_size: int) -> None:
    """
    Validate an uploaded image file.

    Args:
        filename: Original filename.
        content: File content bytes.
        max_size: Maximum allowed file size in bytes.

    Raises:
        ValueError: If the file is empty, too large, or has an unsupported format.
    """
    if not filename:
        raise ValueError("No filename provided.")

    if len(content) == 0:
        raise ValueError("The uploaded file is empty.")

    if len(content) > max_size:
        raise ValueError("File is too large. Maximum size is 10 MB.")

    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    allowed = {"jpg", "jpeg", "png", "webp"}
    if extension not in allowed:
        raise ValueError(
            f"Unsupported file format: .{extension}. "
            "Please upload a JPEG, PNG, or WebP image."
        )
