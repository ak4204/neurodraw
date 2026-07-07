"""
Upload your model files to HF Model Hub.

Usage:
  1. pip install huggingface_hub
  2. Set your HF token:   huggingface-cli login
  3. Edit REPO_ID below with your HF username
  4. Run:  python upload_to_hf.py

Model files must be in backend/models/ locally.
They will be uploaded to: https://huggingface.co/REPO_ID
"""
import os
from pathlib import Path

# ── EDIT THIS ────────────────────────────────────────────────────
REPO_ID = "YOUR_HF_USERNAME/neurodraw-models"   # <-- change this
# ─────────────────────────────────────────────────────────────────

MODEL_DIR = Path(__file__).parent / "backend" / "models"

MODEL_FILES = [
    "drawing_type_3class.keras",
    "final_model_Spiral.keras",
    "final_model_Wave.keras",
    "final_model_Unified.keras",
    "pahaw_pipeline_v3.joblib",
]


def main():
    try:
        from huggingface_hub import HfApi, create_repo
    except ImportError:
        print("Install huggingface_hub first:  pip install huggingface_hub")
        return

    api = HfApi()

    # Create repo if it doesn't exist
    try:
        create_repo(REPO_ID, repo_type="model", exist_ok=True)
        print(f"Repo ready: https://huggingface.co/{REPO_ID}")
    except Exception as e:
        print(f"Could not create repo: {e}")
        return

    for filename in MODEL_FILES:
        filepath = MODEL_DIR / filename
        if not filepath.exists():
            print(f"[SKIP] {filename} not found in backend/models/")
            continue

        size_mb = filepath.stat().st_size / 1024 / 1024
        print(f"Uploading {filename} ({size_mb:.0f} MB)...")
        try:
            api.upload_file(
                path_or_fileobj=str(filepath),
                path_in_repo=filename,
                repo_id=REPO_ID,
                repo_type="model",
                commit_message=f"Upload {filename}",
            )
            print(f"  [OK] {filename}")
        except Exception as e:
            print(f"  [ERROR] {filename}: {e}")

    print()
    print("Done! Now set this as your HF Space secret:")
    print(f"  HF_MODEL_REPO = {REPO_ID}")


if __name__ == "__main__":
    main()
