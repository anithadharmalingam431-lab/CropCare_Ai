"""
Model training script for CropCare AI.

This script trains the CNN model on a dataset of leaf images organized as:

  dataset/
    Healthy/
      img1.jpg
      img2.jpg
      ...
    Early Blight/
      img1.jpg
      ...
    Late Blight/
      ...
    Leaf Spot/
      ...
    Rust/
      ...
    Powdery Mildew/
      ...

Each subfolder name must match a class in DISEASE_CLASSES (see config.py).

Usage:
  python train.py --dataset path/to/dataset --epochs 30

If no dataset is available, the script generates synthetic training data
so the model can still be trained for demonstration purposes.

The trained model is saved to models/crop_disease_model.h5.
"""

import argparse
import os

import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

from config import DISEASE_CLASSES, IMG_SIZE, INPUT_SHAPE, MODEL_PATH, NUM_CLASSES
from model import build_model, save_model


def train_with_dataset(dataset_dir: str, epochs: int, batch_size: int):
    """Train the model using real images from a directory structure."""
    if not os.path.isdir(dataset_dir):
        raise FileNotFoundError(f"Dataset directory not found: {dataset_dir}")

    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.15,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode="nearest",
        validation_split=0.2,
    )

    train_gen = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=batch_size,
        class_mode="categorical",
        subset="training",
        classes=DISEASE_CLASSES,
    )

    val_gen = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=batch_size,
        class_mode="categorical",
        subset="validation",
        classes=DISEASE_CLASSES,
    )

    model = build_model()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            patience=10, restore_best_weights=True, monitor="val_loss"
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=5, min_lr=1e-6
        ),
    ]

    model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=epochs,
        callbacks=callbacks,
    )

    save_model(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


def train_with_synthetic_data(epochs: int, samples_per_class: int = 200):
    """
    Generate synthetic leaf-like images and train the model.
    Each class gets images with different color profiles so the CNN
    can learn to distinguish them.
    """
    print("No dataset provided — generating synthetic training data...")

    rng = np.random.default_rng(42)

    # Class color profiles (mean RGB for each class)
    class_profiles = {
        0: np.array([60, 140, 60], dtype=np.float32),    # Healthy — green
        1: np.array([140, 100, 50], dtype=np.float32),   # Early Blight — brown
        2: np.array([80, 60, 40], dtype=np.float32),     # Late Blight — dark brown
        3: np.array([120, 90, 60], dtype=np.float32),    # Leaf Spot — tan-brown
        4: np.array([200, 100, 40], dtype=np.float32),  # Rust — orange-brown
        5: np.array([220, 220, 210], dtype=np.float32),  # Powdery Mildew — white
    }

    x_data = []
    y_data = []

    for class_idx in range(NUM_CLASSES):
        profile = class_profiles[class_idx]
        for _ in range(samples_per_class):
            # Base color + noise
            img = np.broadcast_to(profile, (IMG_SIZE, IMG_SIZE, 3)).copy()
            noise = rng.normal(0, 25, img.shape).astype(np.float32)
            img = np.clip(img + noise, 0, 255)

            # Add some random "spots" for diseased classes
            if class_idx != 0:
                num_spots = rng.integers(3, 12)
                for _ in range(num_spots):
                    cy, cx = rng.integers(10, IMG_SIZE - 10, size=2)
                    radius = rng.integers(3, 12)
                    spot_color = rng.integers(0, 80, size=3)
                    cv2_circle(img, cx, cy, radius, spot_color)

            img = img / 255.0
            x_data.append(img)
            y_data.append(class_idx)

    x_data = np.array(x_data, dtype=np.float32)
    y_data = tf.keras.utils.to_categorical(y_data, num_classes=NUM_CLASSES)

    # Shuffle
    indices = rng.permutation(len(x_data))
    x_data = x_data[indices]
    y_data = y_data[indices]

    # Split 80/20
    split = int(0.8 * len(x_data))
    x_train, x_val = x_data[:split], x_data[split:]
    y_train, y_val = y_data[:split], y_data[split:]

    model = build_model()

    datagen = ImageDataGenerator(
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        fill_mode="nearest",
    )
    datagen.fit(x_train)

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            patience=10, restore_best_weights=True, monitor="val_loss"
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=5, min_lr=1e-6
        ),
    ]

    model.fit(
        datagen.flow(x_train, y_train, batch_size=32),
        validation_data=(x_val, y_val),
        epochs=epochs,
        callbacks=callbacks,
    )

    save_model(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


def cv2_circle(img, cx, cy, radius, color):
    """Draw a filled circle on the image (simple OpenCV-free implementation)."""
    h, w = img.shape[:2]
    y_indices, x_indices = np.ogrid[:h, :w]
    mask = (x_indices - cx) ** 2 + (y_indices - cy) ** 2 <= radius ** 2
    img[mask] = color


def main():
    parser = argparse.ArgumentParser(description="Train CropCare AI disease detection model")
    parser.add_argument("--dataset", type=str, default=None,
                        help="Path to dataset directory with class subfolders")
    parser.add_argument("--epochs", type=int, default=30,
                        help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32,
                        help="Training batch size")
    parser.add_argument("--synthetic-samples", type=int, default=200,
                        help="Samples per class for synthetic data generation")
    args = parser.parse_args()

    if args.dataset:
        train_with_dataset(args.dataset, args.epochs, args.batch_size)
    else:
        train_with_synthetic_data(args.epochs, args.synthetic_samples)


if __name__ == "__main__":
    main()
