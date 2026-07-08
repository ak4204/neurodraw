"""
inference/pahaw_pipeline.py — PaHaW classical ML pipeline wrapper.

Handles .svc digitizer stroke data (X Y timestamp pressure azimuth altitude).
This pipeline is COMPLETELY isolated from the photo-upload flow.
It appears ONLY on the /research Model Zoo page.
"""

import io
import logging
import os
import random
from typing import Any

import numpy as np

from .config import PAHAW_MODEL_FILE

logger = logging.getLogger(__name__)

_pahaw_model = None
_pahaw_is_mock = True


def load_pahaw() -> bool:
    """Load the PaHaW classical ML pipeline. Returns True if real model loaded."""
    global _pahaw_model, _pahaw_is_mock

    if not os.path.exists(PAHAW_MODEL_FILE):
        logger.warning(
            "PaHaW model not found at %s — using mock inference.", PAHAW_MODEL_FILE
        )
        _pahaw_is_mock = True
        return False

    try:
        import joblib  # noqa: PLC0415

        obj = joblib.load(PAHAW_MODEL_FILE)
        if isinstance(obj, dict):
            if "model" in obj:
                _pahaw_model = obj["model"]
            elif "pipeline" in obj:
                _pahaw_model = obj["pipeline"]
            else:
                for val in obj.values():
                    if hasattr(val, "predict"):
                        _pahaw_model = val
                        break
                if _pahaw_model is None:
                    raise ValueError(f"No predict method found in dict keys: {list(obj.keys())}")
        else:
            _pahaw_model = obj

        _pahaw_is_mock = False
        logger.info("PaHaW pipeline loaded from %s", PAHAW_MODEL_FILE)
        return True
    except Exception as exc:
        logger.error("Failed to load PaHaW pipeline: %s — falling back to mock.", exc)
        _pahaw_model = None
        _pahaw_is_mock = True
        return False


def _parse_svc(file_bytes: bytes) -> np.ndarray:
    """
    Parse .svc file format: tab-separated columns
    X  Y  timestamp  pressure  azimuth  altitude
    Returns numpy array shape (N, 6).
    """
    text = file_bytes.decode("utf-8", errors="replace")
    rows = []
    for line in text.strip().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) >= 6:
            try:
                rows.append([float(p) for p in parts[:6]])
            except ValueError:
                continue
    if not rows:
        raise ValueError("No valid stroke data found in .svc file")
    return np.array(rows, dtype=np.float64)


def _extract_features(strokes: np.ndarray) -> dict[str, float]:
    """
    Extract kinematic/pressure/tremor features from stroke data.
    Subset of the ~80 features used in training; sufficient for demo inference.
    """
    x, y, t, pressure, azimuth, altitude = strokes.T

    # Sort by timestamp
    order = np.argsort(t)
    x, y, t, pressure = x[order], y[order], t[order], pressure[order]

    dt = np.diff(t)
    dt = np.where(dt == 0, 1e-6, dt)  # avoid divide-by-zero

    dx, dy = np.diff(x), np.diff(y)
    velocity = np.sqrt(dx**2 + dy**2) / dt
    acceleration = np.diff(velocity) / dt[:-1] if len(velocity) > 1 else np.array([0.0])
    jerk = np.diff(acceleration) / dt[:-2] if len(acceleration) > 1 else np.array([0.0])

    # Curvature
    ddx, ddy = np.diff(dx), np.diff(dy)
    curvature = np.abs(dx[:-1] * ddy - dy[:-1] * ddx) / (velocity[:-1] ** 2 + 1e-9)

    features = {
        "velocity_mean": float(np.mean(velocity)),
        "velocity_std": float(np.std(velocity)),
        "velocity_max": float(np.max(velocity)),
        "acceleration_mean": float(np.mean(np.abs(acceleration))),
        "jerk_mean": float(np.mean(np.abs(jerk))),
        "curvature_mean": float(np.mean(curvature)),
        "curvature_std": float(np.std(curvature)),
        "pressure_mean": float(np.mean(pressure)),
        "pressure_std": float(np.std(pressure)),
        "pressure_min": float(np.min(pressure)),
        "pressure_max": float(np.max(pressure)),
        "azimuth_mean": float(np.mean(azimuth)),
        "altitude_mean": float(np.mean(altitude)),
        "stroke_duration": float(t[-1] - t[0]),
        "total_distance": float(np.sum(np.sqrt(dx**2 + dy**2))),
        "num_points": float(len(strokes)),
    }
    return features


def _mock_result() -> dict[str, Any]:
    prob = random.uniform(0.3, 0.8)
    pred = "Parkinson" if prob >= 0.5 else "Healthy"
    return {
        "prediction": pred,
        "probability": prob,
        "features_extracted": 16,
        "is_mock": True,
        "note": "Mock result — pahaw_pipeline_v3.joblib not found in backend/models/",
    }


def process_svc_file(file_bytes: bytes) -> dict[str, Any]:
    """
    Run the PaHaW pipeline on raw .svc file bytes.

    Returns:
        {
            "prediction": str,
            "probability": float,
            "features_extracted": int,
            "features": dict,
            "is_mock": bool,
        }
    """
    if _pahaw_is_mock or _pahaw_model is None:
        return _mock_result()

    try:
        strokes = _parse_svc(file_bytes)
        features = _extract_features(strokes)
        feature_vec = np.array(list(features.values())).reshape(1, -1)

        if hasattr(_pahaw_model, "predict_proba"):
            prob_arr = _pahaw_model.predict_proba(feature_vec)[0]
            prob = float(prob_arr[1]) if len(prob_arr) > 1 else float(prob_arr[0])
        else:
            prob = float(_pahaw_model.predict(feature_vec)[0])

        pred = "Parkinson" if prob >= 0.5 else "Healthy"
        return {
            "prediction": pred,
            "probability": prob,
            "features_extracted": len(features),
            "features": features,
            "is_mock": False,
        }
    except Exception as exc:
        logger.error("PaHaW inference error: %s", exc)
        raise

def process_manual_features(features: dict[str, float]) -> dict[str, Any]:
    """
    Run the PaHaW pipeline on manually entered features.
    Ensures exact feature order required by the model.
    """
    if _pahaw_is_mock or _pahaw_model is None:
        return _mock_result()

    try:
        # Ensure exact order matching _extract_features
        ordered_keys = [
            "velocity_mean", "velocity_std", "velocity_max",
            "acceleration_mean", "jerk_mean",
            "curvature_mean", "curvature_std",
            "pressure_mean", "pressure_std", "pressure_min", "pressure_max",
            "azimuth_mean", "altitude_mean",
            "stroke_duration", "total_distance", "num_points"
        ]
        
        # Verify all keys exist
        missing = [k for k in ordered_keys if k not in features]
        if missing:
            raise ValueError(f"Missing manual features: {missing}")
            
        feature_list = [float(features[k]) for k in ordered_keys]
        feature_vec = np.array(feature_list).reshape(1, -1)

        if hasattr(_pahaw_model, "predict_proba"):
            prob_arr = _pahaw_model.predict_proba(feature_vec)[0]
            prob = float(prob_arr[1]) if len(prob_arr) > 1 else float(prob_arr[0])
        else:
            prob = float(_pahaw_model.predict(feature_vec)[0])

        pred = "Parkinson" if prob >= 0.5 else "Healthy"
        return {
            "prediction": pred,
            "probability": prob,
            "features_extracted": len(feature_list),
            "features": features,
            "is_mock": False,
        }
    except Exception as exc:
        logger.error("PaHaW manual inference error: %s", exc)
        raise

