"""
inference/vgg16_models.py — Spiral / Wave / Unified VGG16 wrappers.

Preprocessing is EXACTLY as specified — no additions, no modifications:
    img = img.resize((224, 224))
    arr = np.array(img).astype('float32') / 255.0
    arr = np.expand_dims(arr, axis=0)
    prob = float(model.predict(arr, verbose=0)[0][0])
    pred = 'Parkinson' if prob >= 0.5 else 'Healthy'
"""

import logging
import os
import random
import time

import numpy as np
from PIL import Image

from .config import (
    SPIRAL_MODEL_FILE,
    UNIFIED_MODEL_FILE,
    VGG16_INPUT_SHAPE,
    VGG16_THRESHOLD,
    WAVE_MODEL_FILE,
)

logger = logging.getLogger(__name__)

# Module-level model references — loaded once at startup
_spiral_model = None
_wave_model = None
_unified_model = None
_spiral_is_mock = True
_wave_is_mock = True
_unified_is_mock = True


def _try_load(model_file: str, name: str):
    """Attempt to load a Keras model; return (model, is_mock)."""
    if not os.path.exists(model_file):
        logger.warning(
            "%s model not found at %s — using mock inference.", name, model_file
        )
        return None, True
    try:
        import tensorflow as tf  # noqa: PLC0415

        model = tf.keras.models.load_model(model_file)
        logger.info("%s model loaded from %s", name, model_file)
        return model, False
    except Exception as exc:
        logger.error("Failed to load %s model: %s — falling back to mock.", name, exc)
        return None, True


def load_vgg16_models() -> dict[str, bool]:
    """
    Load all three VGG16 diagnostic models.
    Returns dict of {model_name: is_real} for status reporting.
    """
    global _spiral_model, _wave_model, _unified_model
    global _spiral_is_mock, _wave_is_mock, _unified_is_mock

    _spiral_model, _spiral_is_mock = _try_load(SPIRAL_MODEL_FILE, "Spiral VGG16")
    _wave_model, _wave_is_mock = _try_load(WAVE_MODEL_FILE, "Wave VGG16")
    _unified_model, _unified_is_mock = _try_load(UNIFIED_MODEL_FILE, "Unified VGG16")

    return {
        "spiral": not _spiral_is_mock,
        "wave": not _wave_is_mock,
        "unified": not _unified_is_mock,
    }


def _exact_preprocess(pil_image: Image.Image) -> np.ndarray:
    """
    Exact preprocessing as specified. Do NOT modify this function.
    Source spec: img.resize(224,224) → /255 → expand_dims.
    """
    h, w = VGG16_INPUT_SHAPE
    img = pil_image.convert("RGB")
    img = img.resize((w, h))
    arr = np.array(img).astype("float32") / 255.0
    arr = np.expand_dims(arr, axis=0)
    return arr


def _mock_result(model_name: str) -> dict:
    """Return a flagged mock inference result."""
    prob = random.uniform(0.25, 0.85)
    pred = "Parkinson" if prob >= VGG16_THRESHOLD else "Healthy"
    return {
        "label": pred,
        "prob": prob,
        "is_mock": True,
        "model_name": model_name,
        "inference_time_ms": round(random.uniform(50, 200), 1),
    }


def _run_model(model, is_mock: bool, model_name: str, pil_image: Image.Image) -> dict:
    """Generic runner for any of the three VGG16 models."""
    if is_mock or model is None:
        return _mock_result(model_name)

    arr = _exact_preprocess(pil_image)
    t0 = time.perf_counter()
    prob = float(model.predict(arr, verbose=0)[0][0])
    elapsed_ms = round((time.perf_counter() - t0) * 1000, 1)
    pred = "Parkinson" if prob >= VGG16_THRESHOLD else "Healthy"

    return {
        "label": pred,
        "prob": prob,
        "is_mock": False,
        "model_name": model_name,
        "inference_time_ms": elapsed_ms,
    }


def run_spiral(pil_image: Image.Image) -> dict:
    """Run the Spiral specialist VGG16 model."""
    return _run_model(_spiral_model, _spiral_is_mock, "Spiral VGG16", pil_image)


def run_wave(pil_image: Image.Image) -> dict:
    """Run the Wave specialist VGG16 model."""
    return _run_model(_wave_model, _wave_is_mock, "Wave VGG16", pil_image)


def run_unified(pil_image: Image.Image) -> dict:
    """Run the Unified (spiral+wave combined) VGG16 model."""
    return _run_model(_unified_model, _unified_is_mock, "Unified VGG16", pil_image)
