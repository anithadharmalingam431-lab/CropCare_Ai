"""
SQLite database layer for storing and retrieving prediction history.
Uses Python's built-in sqlite3 module.

Schema:
  predictions table:
    id          INTEGER PRIMARY KEY AUTOINCREMENT
    crop        TEXT NOT NULL
    disease     TEXT NOT NULL
    confidence  REAL NOT NULL
    status      TEXT NOT NULL
    image_path  TEXT
    description TEXT
    symptoms    TEXT (JSON array)
    recommendation TEXT (JSON array)
    created_at  TEXT NOT NULL (ISO timestamp)
"""

import json
import os
import sqlite3
from datetime import datetime, timezone

from config import DB_PATH


def get_connection() -> sqlite3.Connection:
    """Return a connection to the SQLite database, creating it if needed."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create the predictions table if it doesn't exist."""
    conn = get_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crop TEXT NOT NULL,
                disease TEXT NOT NULL,
                confidence REAL NOT NULL,
                status TEXT NOT NULL,
                image_path TEXT,
                description TEXT,
                symptoms TEXT,
                recommendation TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_predictions_created_at "
            "ON predictions (created_at DESC)"
        )
        conn.commit()
    finally:
        conn.close()


def save_prediction(
    crop: str,
    disease: str,
    confidence: float,
    status: str,
    image_path: str | None = None,
    description: str | None = None,
    symptoms: list | None = None,
    recommendation: list | None = None,
) -> dict:
    """
    Insert a prediction record into the database.

    Returns:
        The inserted record as a dict including the generated id and timestamp.
    """
    created_at = datetime.now(timezone.utc).isoformat()
    symptoms_json = json.dumps(symptoms) if symptoms else None
    recommendation_json = json.dumps(recommendation) if recommendation else None

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO predictions
                (crop, disease, confidence, status, image_path, description,
                 symptoms, recommendation, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (crop, disease, confidence, status, image_path, description,
             symptoms_json, recommendation_json, created_at),
        )
        conn.commit()
        record_id = cursor.lastrowid
        return {
            "id": record_id,
            "crop": crop,
            "disease": disease,
            "confidence": confidence,
            "status": status,
            "image_path": image_path,
            "description": description,
            "symptoms": symptoms,
            "recommendation": recommendation,
            "created_at": created_at,
        }
    finally:
        conn.close()


def get_all_predictions(limit: int = 100) -> list[dict]:
    """Retrieve all prediction records, newest first."""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM predictions ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
        result = []
        for row in rows:
            record = dict(row)
            if record.get("symptoms"):
                record["symptoms"] = json.loads(record["symptoms"])
            if record.get("recommendation"):
                record["recommendation"] = json.loads(record["recommendation"])
            result.append(record)
        return result
    finally:
        conn.close()


def get_prediction_by_id(prediction_id: int) -> dict | None:
    """Retrieve a single prediction by ID."""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM predictions WHERE id = ?", (prediction_id,)
        ).fetchone()
        if row is None:
            return None
        record = dict(row)
        if record.get("symptoms"):
            record["symptoms"] = json.loads(record["symptoms"])
        if record.get("recommendation"):
            record["recommendation"] = json.loads(record["recommendation"])
        return record
    finally:
        conn.close()
