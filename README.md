# NeuroDraw 🧠
### AI Research Platform for Parkinson's Handwriting Analysis

[![HF Space](https://img.shields.io/badge/🤗%20HuggingFace-Space-yellow)](https://huggingface.co/spaces/YOUR_USERNAME/neurodraw)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)

> ⚠️ **Research demonstration only** — NOT a medical device. Not for clinical diagnosis.

A research-lab-grade web platform demonstrating a **multi-model Parkinson's Disease detection system** based on handwriting analysis (spiral and wave drawings).

---

## 🚀 Features

- **Multi-Model Pipeline**: MobileNetV2 routing classifier → Spiral/Wave/Unified VGG16 specialists
- **3 Analysis Modes**: Auto-route / Manual select / Run All Three
- **Quality Check**: Pre-inference blur, brightness, resolution, and background heuristics
- **PaHaW Classical Pipeline**: Kinematic feature analysis on digitizer stroke files (.svc)
- **Parkinson's Education Page**: Comprehensive 8-section disease guide
- **Research Dashboard**: Model metrics, ROC curves, confusion matrix, threshold explorer
- **PDF Reports**: Exportable per-case inference reports
- **Mock Mode**: Runs cleanly without model files (clearly disclosed)

## 📊 Pipeline Architecture

```
Upload → MobileNetV2 Router → [Spiral | Wave | Garbage]
                ↓
    AUTO:  Specialist VGG16 + Unified VGG16 (parallel)
    ALL THREE: All 3 models, bypasses Garbage gate
    MANUAL: User selects model
                ↓
        PDF Report Generation
```

## 📁 Project Structure

```
neurodraw/
├── backend/                    ← FastAPI inference server
│   ├── app.py                  ← Main FastAPI app
│   ├── inference/
│   │   ├── config.py           ← ALL model constants (single source of truth)
│   │   ├── router.py           ← MobileNetV2 routing classifier
│   │   ├── vgg16_models.py     ← Spiral / Wave / Unified VGG16
│   │   ├── pahaw_pipeline.py   ← Classical kinematic ML
│   │   └── quality_check.py   ← Image quality heuristics
│   ├── api/                    ← FastAPI routers
│   └── models/                 ← Drop .keras/.joblib here (gitignored)
├── frontend/                   ← React 18 + Vite
│   └── src/
│       ├── pages/              ← 9 pages
│       ├── components/         ← 15+ components
│       └── hooks/              ← useAnalysis, useHistory
├── hf_space/                   ← Hugging Face Spaces (Docker)
│   ├── Dockerfile
│   ├── app.py                  ← Downloads models from HF Hub, serves everything
│   └── requirements_hf.txt
├── upload_to_hf.py             ← Upload model weights to HF Model Hub
├── .gitignore                  ← Excludes all model files
└── LICENSE                     ← MIT
```

## 💻 Local Development

### Frontend only (mock mode — no Python needed)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Full stack (real inference)
```bash
# Terminal 1 — Backend
pip install -r backend/requirements.txt
pip install opencv-python-headless
cd backend
uvicorn app:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### Add your model files
Place in `backend/models/` (they are gitignored — never committed):
```
backend/models/
├── drawing_type_3class.keras     ← Routing classifier (MobileNetV2, 3-class)
├── final_model_Spiral.keras      ← Spiral VGG16 specialist
├── final_model_Wave.keras        ← Wave VGG16 specialist
├── final_model_Unified.keras     ← Unified VGG16 cross-checker
└── pahaw_pipeline_v3.joblib      ← Classical kinematic pipeline
```

## 🤗 Hugging Face Deployment

Mirrors the [NeuroSSL deployment pattern](https://github.com/abcreativeakshay/neurossl).

### Step 1: Upload models to HF Model Hub
```bash
pip install huggingface_hub
huggingface-cli login
# Edit REPO_ID in upload_to_hf.py, then:
python upload_to_hf.py
```

### Step 2: Create HF Space
1. Go to huggingface.co/new-space
2. SDK: **Docker**
3. Copy files from `hf_space/` into the Space

### Step 3: Set Space secret
In your Space settings → Secrets:
```
HF_MODEL_REPO = your-username/neurodraw-models
```

The app downloads weights automatically on first startup.

## 🛡️ Security Notes

- **No API keys or credentials** are used in this project
- **Model files are gitignored** — they go on HF Model Hub, not GitHub
- **No patient data** — all analysis results are in-memory only (cleared on restart)
- `backend/inference/config.py` is the **single source of truth** for all model configuration

## 📈 Model Details

| Model | Backbone | Purpose |
|-------|----------|---------|
| `drawing_type_3class.keras` | MobileNetV2 | Route: Spiral / Wave / Garbage |
| `final_model_Spiral.keras` | VGG16 | Spiral: Healthy vs Parkinson |
| `final_model_Wave.keras` | VGG16 | Wave: Healthy vs Parkinson |
| `final_model_Unified.keras` | VGG16 | Combined dataset cross-checker |
| `pahaw_pipeline_v3.joblib` | scikit-learn | Kinematic feature analysis |

## ⚕️ Disclaimer

This project is for **educational and research purposes only** and is NOT intended for clinical diagnosis or medical use. Results from this platform should never replace consultation with a qualified healthcare professional.

---

*Inspired by [NeuroSSL](https://github.com/abcreativeakshay/neurossl) — dementia screening via SSL on brain MRI.*
