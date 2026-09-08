# CropCare AI — Backend

AI-Based Crop Disease Detection System backend built with **Python**, **FastAPI**, **TensorFlow/Keras**, **OpenCV**, **NumPy**, and **Pillow**.

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Train the Model

If you have a dataset of leaf images organized by class:

```
dataset/
  Healthy/
  Early Blight/
  Late Blight/
  Leaf Spot/
  Rust/
  Powdery Mildew/
```

```bash
python train.py --dataset path/to/dataset --epochs 30
```

Without a dataset, the script generates synthetic training data:

```bash
python train.py --epochs 30
```

The trained model is saved to `models/crop_disease_model.h5`.

## Run the Server

```bash
python main.py
```

Server runs on `http://localhost:8000`.

Interactive API docs at `http://localhost:8000/docs`.

## API Endpoints

| Method | Path        | Description                          |
|--------|-------------|--------------------------------------|
| GET    | /health     | Check server status and model state  |
| GET    | /diseases   | List all supported diseases          |
| POST   | /predict    | Analyze a leaf image (multipart)     |
| POST   | /history    | Store a prediction record            |
| GET    | /history    | Retrieve all prediction records      |

## Architecture

- `config.py` — Central configuration (paths, classes, parameters)
- `model.py` — CNN model architecture (TensorFlow/Keras)
- `preprocessing.py` — Image preprocessing pipeline (OpenCV, NumPy, Pillow)
- `inference.py` — Model loading and prediction logic
- `disease_info.py` — Disease metadata catalog
- `database.py` — SQLite data layer for history
- `main.py` — FastAPI application with all endpoints
- `train.py` — Model training script

The model is kept separate from the API logic so it can be replaced or retrained without touching the server code.
