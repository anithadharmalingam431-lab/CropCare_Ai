"""
CNN model architecture for crop disease classification.
Uses TensorFlow/Keras to build a convolutional neural network that
classifies leaf images into disease categories.

The model is kept separate from the API logic so it can be replaced
or retrained without touching the server code.
"""

import os

import tensorflow as tf
from tensorflow.keras import layers, models, optimizers

from config import INPUT_SHAPE, NUM_CLASSES


def build_model(input_shape=None, num_classes=None):
    """
    Build a CNN model for crop disease classification.

    Architecture:
      - 3 convolutional blocks with batch norm and max pooling
      - Global average pooling
      - Dense classifier with dropout

    Args:
        input_shape: Tuple (height, width, channels) for input images.
        num_classes: Number of disease classes to predict.

    Returns:
        A compiled Keras Model.
    """
    if input_shape is None:
        input_shape = INPUT_SHAPE
    if num_classes is None:
        num_classes = NUM_CLASSES

    model = models.Sequential(
        [
            # Block 1
            layers.Conv2D(
                32, (3, 3), padding="same", activation="relu",
                input_shape=input_shape, name="conv1",
            ),
            layers.BatchNormalization(name="bn1"),
            layers.MaxPooling2D((2, 2), name="pool1"),

            # Block 2
            layers.Conv2D(64, (3, 3), padding="same", activation="relu", name="conv2"),
            layers.BatchNormalization(name="bn2"),
            layers.MaxPooling2D((2, 2), name="pool2"),

            # Block 3
            layers.Conv2D(128, (3, 3), padding="same", activation="relu", name="conv3"),
            layers.BatchNormalization(name="bn3"),
            layers.MaxPooling2D((2, 2), name="pool3"),

            # Block 4
            layers.Conv2D(256, (3, 3), padding="same", activation="relu", name="conv4"),
            layers.BatchNormalization(name="bn4"),
            layers.MaxPooling2D((2, 2), name="pool4"),

            # Classifier
            layers.GlobalAveragePooling2D(name="gap"),
            layers.Dropout(0.5, name="dropout"),
            layers.Dense(128, activation="relu", name="fc1"),
            layers.Dropout(0.3, name="dropout2"),
            layers.Dense(num_classes, activation="softmax", name="predictions"),
        ]
    )

    model.compile(
        optimizer=optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def load_model(model_path):
    """
    Load a trained Keras model from disk.

    Args:
        model_path: Path to the .h5 model file.

    Returns:
        A loaded Keras Model, or None if the file doesn't exist.
    """
    if not os.path.exists(model_path):
        return None
    return tf.keras.models.load_model(model_path)


def save_model(model, model_path):
    """Save a Keras model to disk."""
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    model.save(model_path)
