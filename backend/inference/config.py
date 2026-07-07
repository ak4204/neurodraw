"""
inference/config.py — Single source of truth for ALL model configuration.

To swap in the real routing classifier: update ROUTER_INPUT_SHAPE,
ROUTER_NORMALIZE, and ROUTER_LABELS here ONLY. No other file needs touching.
"""

import os

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")

ROUTER_MODEL_FILE  = os.path.join(MODEL_DIR, "drawing_type_3class.keras")
SPIRAL_MODEL_FILE  = os.path.join(MODEL_DIR, "final_model_Spiral.keras")
WAVE_MODEL_FILE    = os.path.join(MODEL_DIR, "final_model_Wave.keras")
UNIFIED_MODEL_FILE = os.path.join(MODEL_DIR, "final_model_Unified.keras")
PAHAW_MODEL_FILE   = os.path.join(MODEL_DIR, "pahaw_pipeline_v3.joblib")

# ---------------------------------------------------------------------------
# Routing classifier — change ONLY here when swapping the real model
# ---------------------------------------------------------------------------
ROUTER_INPUT_SHAPE: tuple[int, int] = (224, 224)   # (H, W)
ROUTER_INPUT_CHANNELS: int = 3                      # RGB
# Preprocessing mode:
#   "mobilenetv2" → uses tf.keras.applications.mobilenet_v2.preprocess_input  (scales to [-1, 1])
#   "vgg16"       → uses tf.keras.applications.vgg16.preprocess_input          (subtracts ImageNet mean)
#   "normalize"   → simple divide by 255.0 to [0, 1]
ROUTER_PREPROCESS_MODE: str = "mobilenetv2"  # drawing_type_3class.keras uses MobileNetV2

# Ordered label list — matches the alphabetical folder sort used by Keras ImageDataGenerator
# drawing_type_3class: trained on 3 folders → Garbage / Spiral / Wave (alphabetical)
ROUTER_LABELS: list[str] = ["Garbage", "Spiral", "Wave"]
# Confidence below this value → surface as borderline to user
ROUTER_CONFIDENCE_THRESHOLD: float = 0.60
ROUTER_GARBAGE_LABEL: str = "Garbage"

# ---------------------------------------------------------------------------
# VGG16 diagnostic models
# ---------------------------------------------------------------------------
VGG16_INPUT_SHAPE: tuple[int, int] = (224, 224)
VGG16_NORMALIZE: bool = True
# prob >= threshold → Parkinson-consistent
VGG16_THRESHOLD: float = 0.50

# ---------------------------------------------------------------------------
# Quality check thresholds
# ---------------------------------------------------------------------------
QUALITY_BLUR_MIN: float = 100.0          # Laplacian variance minimum
QUALITY_BRIGHTNESS_MIN: int = 40
QUALITY_BRIGHTNESS_MAX: int = 220
QUALITY_MIN_RESOLUTION: tuple[int, int] = (300, 300)  # (W, H) minimum pixels
