"""
inference/router.py — Routing classifier wrapper.

All preprocessing is driven from inference/config.py.
Swapping the real model: drop the file into models/ and update config.py only.
"""

import logging
import os
import random
from typing import Optional

import numpy as np
from PIL import Image

from .config import (
    ROUTER_CONFIDENCE_THRESHOLD,
    ROUTER_GARBAGE_LABEL,
    ROUTER_INPUT_CHANNELS,
    ROUTER_INPUT_SHAPE,
    ROUTER_LABELS,
    ROUTER_MODEL_FILE,
    ROUTER_PREPROCESS_MODE,
)

logger = logging.getLogger(__name__)

# Module-level model reference — loaded once at startup
_router_model = None
_router_is_mock: bool = True


def load_router() -> bool:
    """Load the routing classifier. Returns True if real model loaded, False if mock."""
    global _router_model, _router_is_mock

    if not os.path.exists(ROUTER_MODEL_FILE):
        logger.warning(
            "Router model not found at %s — using mock inference. "
            "Drop routing_classifier.keras into backend/models/ to enable real inference.",
            ROUTER_MODEL_FILE,
        )
        _router_is_mock = True
        return False

    try:
        # Import TF only when model file exists to keep startup fast in mock mode
        import tensorflow as tf  # noqa: PLC0415

        _router_model = tf.keras.models.load_model(ROUTER_MODEL_FILE)
        _router_is_mock = False
        logger.info("Router model loaded from %s", ROUTER_MODEL_FILE)
        return True
    except Exception as exc:
        logger.error("Failed to load router model: %s — falling back to mock.", exc)
        _router_model = None
        _router_is_mock = True
        return False


def _preprocess(pil_image: Image.Image) -> np.ndarray:
    """
    Preprocess image for the routing classifier.
    Mode is driven by ROUTER_PREPROCESS_MODE in config — do NOT hardcode here.
    """
    h, w = ROUTER_INPUT_SHAPE
    img = pil_image.convert("RGB") if ROUTER_INPUT_CHANNELS == 3 else pil_image.convert("L")
    img = img.resize((w, h))
    arr = np.array(img).astype("float32")

    if ROUTER_PREPROCESS_MODE == "mobilenetv2":
        # MobileNetV2 preprocessing: scale to [-1, 1]
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input  # noqa: PLC0415
        arr = preprocess_input(arr)
    elif ROUTER_PREPROCESS_MODE == "vgg16":
        # VGG16 preprocessing: subtract ImageNet channel means
        from tensorflow.keras.applications.vgg16 import preprocess_input  # noqa: PLC0415
        arr = preprocess_input(arr)
    else:
        # Simple normalize [0, 1]
        arr = arr / 255.0

    arr = np.expand_dims(arr, axis=0)
    return arr


def _mock_classify() -> dict:
    """Return a clearly-flagged mock result for layout preview."""
    label = random.choice(["Spiral", "Wave"])
    # Generate plausible fake probabilities summing to 1
    main_conf = random.uniform(0.65, 0.95)
    remainder = 1.0 - main_conf
    other_conf = random.uniform(0.0, remainder)
    garbage_conf = remainder - other_conf
    probs = {lbl: 0.0 for lbl in ROUTER_LABELS}
    probs[label] = main_conf
    other_label = "Wave" if label == "Spiral" else "Spiral"
    probs[other_label] = other_conf
    probs[ROUTER_GARBAGE_LABEL] = garbage_conf

    return {
        "label": label,
        "confidence": main_conf,
        "is_borderline": main_conf < ROUTER_CONFIDENCE_THRESHOLD,
        "is_garbage": False,
        "is_mock": True,
        "all_probs": probs,
    }


def classify_image(pil_image: Image.Image) -> dict:
    """
    Classify an image as Spiral / Wave / Garbage.

    Returns:
        {
            "label": str,
            "confidence": float,
            "is_borderline": bool,    # confidence < ROUTER_CONFIDENCE_THRESHOLD
            "is_garbage": bool,
            "is_mock": bool,          # True when running without real model file
            "all_probs": dict[str, float],
        }
    """
    if _router_is_mock or _router_model is None:
        return _mock_classify()

    arr = _preprocess(pil_image)
    raw_output = _router_model.predict(arr, verbose=0)

    # Support both single-output (binary Spiral vs Wave) and multi-class softmax
    if raw_output.shape[-1] == 1:
        # Binary: 0 = Spiral, 1 = Wave (or as configured)
        prob = float(raw_output[0][0])
        probs = {
            ROUTER_LABELS[0]: 1.0 - prob,
            ROUTER_LABELS[1]: prob,
            ROUTER_GARBAGE_LABEL: 0.0,
        }
        best_label = ROUTER_LABELS[1] if prob >= 0.5 else ROUTER_LABELS[0]
        confidence = prob if prob >= 0.5 else 1.0 - prob
    else:
        # Multi-class softmax — use configured label list
        probs_arr = raw_output[0].tolist()
        probs = {lbl: float(p) for lbl, p in zip(ROUTER_LABELS, probs_arr)}
        best_label = max(probs, key=probs.get)  # type: ignore[arg-type]
        confidence = probs[best_label]

    is_garbage = best_label == ROUTER_GARBAGE_LABEL
    is_borderline = (not is_garbage) and (confidence < ROUTER_CONFIDENCE_THRESHOLD)

    return {
        "label": best_label,
        "confidence": confidence,
        "is_borderline": is_borderline,
        "is_garbage": is_garbage,
        "is_mock": False,
        "all_probs": probs,
    }
