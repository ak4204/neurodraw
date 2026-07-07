"""
inference/config.py — Single source of truth for ALL model configuration.

To swap in the real routing classifier: update ROUTER_INPUT_SHAPE,
ROUTER_NORMALIZE, and ROUTER_LABELS here ONLY. No other file needs touching.
"""

import os
import logging
from huggingface_hub import hf_hub_download

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths & Hugging Face Hub
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

HF_REPO_ID = "ak332/neurodraw-models"

def get_model_path(filename: str) -> str:
    """Return local path if exists, otherwise download from Hugging Face Hub."""
    local_path = os.path.join(MODEL_DIR, filename)
    if os.path.exists(local_path):
        return local_path
    
    try:
        logger.info(f"Downloading {filename} from Hugging Face Hub ({HF_REPO_ID})...")
        return hf_hub_download(repo_id=HF_REPO_ID, filename=filename, cache_dir=MODEL_DIR)
    except Exception as e:
        logger.error(f"Failed to download {filename} from {HF_REPO_ID}: {e}")
        return local_path # Fallback to local path which will trigger mock mode

ROUTER_MODEL_FILE  = get_model_path("drawing_type_3class.keras")
SPIRAL_MODEL_FILE  = get_model_path("final_model_Spiral.keras")
WAVE_MODEL_FILE    = get_model_path("final_model_Wave.keras")
UNIFIED_MODEL_FILE = get_model_path("final_model_Unified.keras")
PAHAW_MODEL_FILE   = get_model_path("pahaw_pipeline_v3.joblib")

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
