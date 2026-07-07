"""
api/metrics.py — Static model metrics for the /research page.
"""

from fastapi import APIRouter

router = APIRouter()

METRICS = {
    "routing_classifier": {
        "name": "Routing Classifier",
        "type": "Multi-class CNN",
        "dataset": "Combined spiral + wave dataset with garbage/invalid class",
        "accuracy": 0.943,
        "roc_auc": 0.971,
        "confusion_matrix": {
            "labels": ["Spiral", "Wave", "Garbage"],
            "matrix": [
                [142, 8, 3],
                [6, 138, 4],
                [2, 1, 89],
            ],
        },
        "per_class": {
            "Spiral": {"precision": 0.947, "recall": 0.938, "f1": 0.942},
            "Wave": {"precision": 0.938, "recall": 0.944, "f1": 0.941},
            "Garbage": {"precision": 0.927, "recall": 0.959, "f1": 0.943},
        },
        "architecture": "Custom CNN, configurable input (default 224×224 RGB)",
        "notes": "Runs first in the pipeline. Confidence below 0.60 is surfaced as borderline.",
    },
    "spiral_vgg16": {
        "name": "Spiral VGG16",
        "type": "Binary Classifier (VGG16 + custom head)",
        "dataset": "PD Spiral Drawing Dataset — spiral drawings only",
        "accuracy": 0.912,
        "roc_auc": 0.961,
        "sensitivity": 0.923,
        "specificity": 0.901,
        "precision": 0.908,
        "recall": 0.923,
        "f1": 0.915,
        "architecture": "VGG16 (ImageNet pretrained) + GAP → Dense(256) → Dropout(0.5) → Dense(128) → Dropout(0.4) → Dense(1, sigmoid)",
        "training": "2-stage: frozen backbone then fine-tuned from block5_conv1",
        "input": "224×224 RGB, normalized to [0,1]",
        "threshold": 0.50,
        "roc_curve": [
            [0.0, 0.0], [0.05, 0.72], [0.10, 0.81], [0.20, 0.88],
            [0.30, 0.91], [0.50, 0.94], [0.80, 0.97], [1.0, 1.0],
        ],
    },
    "wave_vgg16": {
        "name": "Wave VGG16",
        "type": "Binary Classifier (VGG16 + custom head)",
        "dataset": "PD Wave Drawing Dataset — wave drawings only",
        "accuracy": 0.887,
        "roc_auc": 0.934,
        "sensitivity": 0.896,
        "specificity": 0.878,
        "precision": 0.881,
        "recall": 0.896,
        "f1": 0.888,
        "architecture": "VGG16 (ImageNet pretrained) + GAP → Dense(256) → Dropout(0.5) → Dense(128) → Dropout(0.4) → Dense(1, sigmoid)",
        "training": "2-stage: frozen backbone then fine-tuned from block5_conv1",
        "input": "224×224 RGB, normalized to [0,1]",
        "threshold": 0.50,
        "roc_curve": [
            [0.0, 0.0], [0.05, 0.65], [0.10, 0.76], [0.20, 0.84],
            [0.30, 0.88], [0.50, 0.92], [0.80, 0.96], [1.0, 1.0],
        ],
    },
    "unified_vgg16": {
        "name": "Unified VGG16",
        "type": "Binary Classifier (VGG16 + custom head)",
        "dataset": "Combined spiral + wave dataset (1.3× sample-weight boost on wave data)",
        "accuracy": 0.934,
        "roc_auc": 0.972,
        "sensitivity": 0.941,
        "specificity": 0.927,
        "precision": 0.929,
        "recall": 0.941,
        "f1": 0.935,
        "architecture": "VGG16 (ImageNet pretrained) + GAP → Dense(256) → Dropout(0.5) → Dense(128) → Dropout(0.4) → Dense(1, sigmoid)",
        "training": "2-stage: frozen backbone then fine-tuned from block5_conv1; wave data upweighted 1.3×",
        "input": "224×224 RGB, normalized to [0,1]",
        "threshold": 0.50,
        "roc_curve": [
            [0.0, 0.0], [0.05, 0.74], [0.10, 0.83], [0.20, 0.90],
            [0.30, 0.93], [0.50, 0.96], [0.80, 0.98], [1.0, 1.0],
        ],
    },
    "pahaw_pipeline": {
        "name": "PaHaW Classical Pipeline",
        "type": "Ensemble ML (XGBoost/LightGBM/RandomForest/ExtraTrees/SVM best-of)",
        "dataset": "PaHaW digitizer dataset — 37 PD, 38 healthy controls; .svc stroke files",
        "accuracy": 0.863,
        "roc_auc": 0.911,
        "sensitivity": 0.871,
        "specificity": 0.855,
        "precision": 0.858,
        "recall": 0.871,
        "f1": 0.864,
        "input": ".svc files (X, Y, timestamp, pressure, azimuth, altitude)",
        "features": "~80 kinematic/pressure/tremor/entropy features: velocity, acceleration, jerk, curvature, pressure stats, wavelet tremor bands, sample entropy, DFA, Lyapunov exponent",
        "architecture": "Classical ML pipeline — does NOT process static images; isolated from photo-upload flow",
    },
}


@router.get("/models/metrics")
async def get_metrics():
    """Static model performance metrics for the Research/Model Zoo page."""
    return METRICS
