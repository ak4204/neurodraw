"""
inference/quality_check.py — Image quality assessment heuristics.

Runs before diagnostic inference to surface potential issues with the uploaded image.
All thresholds come from config.py.
"""

import logging
from typing import Any

import cv2
import numpy as np
from PIL import Image

from .config import (
    QUALITY_BLUR_MIN,
    QUALITY_BRIGHTNESS_MAX,
    QUALITY_BRIGHTNESS_MIN,
    QUALITY_MIN_RESOLUTION,
)

logger = logging.getLogger(__name__)


def _check_resolution(pil_image: Image.Image) -> dict[str, Any]:
    w, h = pil_image.size
    min_w, min_h = QUALITY_MIN_RESOLUTION
    passed = w >= min_w and h >= min_h
    return {
        "name": "Resolution",
        "status": "pass" if passed else "warn",
        "message": f"Image is {w}×{h}px" + ("" if passed else f" — minimum recommended is {min_w}×{min_h}px"),
        "value": f"{w}×{h}",
    }


def _check_blur(pil_image: Image.Image) -> dict[str, Any]:
    gray = np.array(pil_image.convert("L"))
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    passed = laplacian_var >= QUALITY_BLUR_MIN
    return {
        "name": "Sharpness",
        "status": "pass" if passed else "warn",
        "message": (
            "Image appears sharp" if passed
            else "Image may be blurry — ensure the drawing is in focus"
        ),
        "value": round(laplacian_var, 1),
    }


def _check_brightness(pil_image: Image.Image) -> dict[str, Any]:
    arr = np.array(pil_image.convert("L")).astype(float)
    mean_brightness = float(arr.mean())
    too_dark = mean_brightness < QUALITY_BRIGHTNESS_MIN
    too_bright = mean_brightness > QUALITY_BRIGHTNESS_MAX
    if too_dark:
        status, msg = "warn", "Image appears too dark — ensure adequate lighting"
    elif too_bright:
        status, msg = "warn", "Image appears overexposed — reduce glare or lighting"
    else:
        status, msg = "pass", "Brightness is within acceptable range"
    return {
        "name": "Exposure",
        "status": status,
        "message": msg,
        "value": round(mean_brightness, 1),
    }


def _check_background(pil_image: Image.Image) -> dict[str, Any]:
    """
    Heuristic: if edge density is very high, background may be cluttered.
    A clean white paper background should have low edge density outside the drawing.
    """
    gray = np.array(pil_image.convert("L"))
    edges = cv2.Canny(gray, threshold1=50, threshold2=150)
    edge_density = float(edges.mean())  # 0–255, proportion of edge pixels * 255
    # High density (>40) suggests a complex/cluttered background
    if edge_density > 40:
        status = "warn"
        msg = "Background may be cluttered — use plain white paper for best results"
    else:
        status = "pass"
        msg = "Background appears clean"
    return {
        "name": "Background",
        "status": status,
        "message": msg,
        "value": round(edge_density, 2),
    }


def _check_full_visibility(pil_image: Image.Image) -> dict[str, Any]:
    """
    Heuristic: check if drawing content extends to image edges (clipped drawing).
    Looks for significant non-white content near all four edges.
    """
    gray = np.array(pil_image.convert("L"))
    h, w = gray.shape
    border_px = max(10, min(h, w) // 20)  # 5% border strip
    border_mean = np.mean([
        gray[:border_px, :].mean(),
        gray[-border_px:, :].mean(),
        gray[:, :border_px].mean(),
        gray[:, -border_px:].mean(),
    ])
    # If borders are much darker than white (255), content may be clipped
    clipped = border_mean < 200
    return {
        "name": "Full Visibility",
        "status": "warn" if clipped else "pass",
        "message": (
            "Drawing may be partially clipped at edges — ensure the full drawing is visible"
            if clipped else "Full drawing appears visible"
        ),
        "value": round(float(border_mean), 1),
    }


def assess_quality(pil_image: Image.Image) -> dict[str, Any]:
    """
    Run all quality checks on the PIL image.

    Returns:
        {
            "passed": bool,          # True if no 'fail' checks (warns are soft)
            "has_warnings": bool,    # True if any 'warn' checks
            "checks": [
                {"name", "status": "pass"|"warn"|"fail", "message", "value"}
            ]
        }
    """
    checks = [
        _check_resolution(pil_image),
        _check_blur(pil_image),
        _check_brightness(pil_image),
        _check_background(pil_image),
        _check_full_visibility(pil_image),
    ]

    has_fail = any(c["status"] == "fail" for c in checks)
    has_warn = any(c["status"] == "warn" for c in checks)

    return {
        "passed": not has_fail,
        "has_warnings": has_warn,
        "checks": checks,
    }
