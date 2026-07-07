"""
NeuroDraw — HF Spaces app entry point
Serves FastAPI backend + built React frontend from one container.
Downloads model weights from Hugging Face Model Hub on first startup.

Deployment pattern identical to NeuroSSL (github.com/abcreativeakshay/neurossl).
"""
import os
import sys
import logging

# ── Paths ────────────────────────────────────────────────────────────────────
APP_DIR    = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(APP_DIR, "models")
STATIC_DIR = os.path.join(APP_DIR, "static")       # built React output

os.makedirs(MODELS_DIR, exist_ok=True)

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s: %(message)s")
logger = logging.getLogger("neurodraw.startup")

# ── Model file map ───────────────────────────────────────────────────────────
# Set HF_MODEL_REPO as a Space secret (or env var) pointing to your
# Hugging Face Model Hub repository:  your-username/neurodraw-models
#
# Files expected in that repo:
#   drawing_type_3class.keras
#   final_model_Spiral.keras
#   final_model_Wave.keras
#   final_model_Unified.keras
#   pahaw_pipeline_v3.joblib

HF_MODEL_REPO = os.environ.get("HF_MODEL_REPO", "")  # e.g. "YourHFUsername/neurodraw-models"
HF_TOKEN      = os.environ.get("HF_TOKEN", "")       # optional, for private repos

MODEL_FILES = [
    "drawing_type_3class.keras",
    "final_model_Spiral.keras",
    "final_model_Wave.keras",
    "final_model_Unified.keras",
    "pahaw_pipeline_v3.joblib",
]


def download_models():
    """Download model weights from HF Hub if not already present."""
    if not HF_MODEL_REPO:
        logger.warning(
            "HF_MODEL_REPO env var not set. "
            "App will run in mock mode. "
            "Set HF_MODEL_REPO=your-username/neurodraw-models as a Space secret."
        )
        return

    try:
        from huggingface_hub import hf_hub_download
        logger.info("Downloading model weights from %s", HF_MODEL_REPO)

        for filename in MODEL_FILES:
            dest = os.path.join(MODELS_DIR, filename)
            if os.path.exists(dest):
                logger.info("  [SKIP] %s already present", filename)
                continue
            try:
                path = hf_hub_download(
                    repo_id=HF_MODEL_REPO,
                    filename=filename,
                    local_dir=MODELS_DIR,
                    token=HF_TOKEN or None,
                )
                logger.info("  [OK]   %s -> %s", filename, path)
            except Exception as e:
                logger.error("  [FAIL] %s: %s", filename, e)
    except ImportError:
        logger.error("huggingface_hub not installed. Run: pip install huggingface_hub")


def mount_static(app):
    """Mount the built React frontend as static files."""
    if not os.path.isdir(STATIC_DIR):
        logger.warning(
            "Static dir %s not found — frontend not built. "
            "Run: cd frontend && npm run build && cp -r dist/ ../hf_space/static/",
            STATIC_DIR
        )
        return

    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    # SPA fallback: serve index.html for all unmatched routes
    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        index = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index):
            return FileResponse(index)
        return {"error": "Frontend not built"}

    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
    logger.info("Frontend static files mounted from %s", STATIC_DIR)


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Step 1: Download models
    download_models()

    # Step 2: Import FastAPI app (after models are present)
    sys.path.insert(0, os.path.dirname(APP_DIR))
    from backend.app import app  # noqa: E402

    # Step 3: Mount static frontend
    mount_static(app)

    # Step 4: Start server
    import uvicorn
    port = int(os.environ.get("PORT", 7860))  # HF Spaces uses 7860
    logger.info("Starting NeuroDraw on port %d", port)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
