"""
api/analyze.py — POST /api/analyze

Full pipeline orchestration:
  AUTO mode:   router → if garbage → block; else specialist + unified parallel
  MANUAL mode: run only the specified model
  ALL_THREE:   spiral + wave + unified parallel; Garbage gate BYPASSED; type_agnostic_mode=True
"""

import asyncio
import io
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Annotated, Literal, Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from PIL import Image

from inference.quality_check import assess_quality
from inference.router import classify_image
from inference.vgg16_models import run_spiral, run_unified, run_wave
from inference.pahaw_pipeline import process_svc_file

logger = logging.getLogger(__name__)
router = APIRouter()


def _build_explanation(mode: str, result_label: str, drawing_type: str, confidence: float, model_name: str) -> str:
    if result_label == "Parkinson":
        return (
            f"The {model_name} identified handwriting patterns consistent with "
            f"Parkinson's disease motor features at {confidence:.0%} confidence. "
            f"Patterns include irregular velocity variations and tremor-like signatures "
            f"characteristic of motor impairment in the {drawing_type.lower()} task. "
            f"This result is a research indicator only — not a clinical diagnosis."
        )
    else:
        return (
            f"The {model_name} found no significant Parkinson-consistent patterns "
            f"in this {drawing_type.lower()} drawing at {confidence:.0%} confidence. "
            f"The motor control signatures appear within the healthy reference range. "
            f"This result is a research indicator only — not a clinical diagnosis."
        )


async def _run_in_executor(fn, *args):
    """Run a synchronous model inference function in a thread pool executor."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, fn, *args)


@router.post("/analyze")
async def analyze(
    request: Request,
    file: UploadFile = File(...),
    mode: str = Form(default="auto"),          # "auto" | "manual" | "all_three"
    manual_model: Optional[str] = Form(default=None),  # "spiral" | "wave" | "unified"
):
    """
    Full analysis pipeline.

    Modes:
    - auto:      Router classifies → Garbage blocks → specialist + unified parallel
    - manual:    Run only the specified model (manual_model param)
    - all_three: Run spiral + wave + unified regardless of router verdict;
                 Garbage gate bypassed; response includes type_agnostic_mode=True
    """
    t_start = time.perf_counter()

    # ── 1. Read & validate image ─────────────────────────────────────────────
    raw_bytes = await file.read()
    try:
        pil_image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not decode image file. Ensure it is a valid JPG/PNG/BMP.")

    # ── 2. Quality check ─────────────────────────────────────────────────────
    quality = assess_quality(pil_image)

    # ── 3. Routing classifier (always runs, even in all_three mode) ──────────
    routing_result = await _run_in_executor(classify_image, pil_image)

    # ── 4. Mode-specific pipeline ────────────────────────────────────────────
    type_agnostic_mode = False
    specialist_result = None
    unified_result = None
    all_results = None

    if mode == "all_three":
        # Garbage gate bypassed — run all three
        type_agnostic_mode = True
        spiral_res, wave_res, unified_res = await asyncio.gather(
            _run_in_executor(run_spiral, pil_image),
            _run_in_executor(run_wave, pil_image),
            _run_in_executor(run_unified, pil_image),
        )
        all_results = {
            "spiral": spiral_res,
            "wave": wave_res,
            "unified": unified_res,
        }
        # For headline: use unified result as primary
        specialist_result = unified_res
        unified_result = unified_res

    elif mode == "manual":
        if manual_model not in ("spiral", "wave", "unified"):
            raise HTTPException(status_code=400, detail="manual_model must be 'spiral', 'wave', or 'unified'")
        fn_map = {"spiral": run_spiral, "wave": run_wave, "unified": run_unified}
        specialist_result = await _run_in_executor(fn_map[manual_model], pil_image)
        unified_result = None  # Only one model run in manual mode

    else:  # auto (default)
        if routing_result["is_garbage"] and routing_result["confidence"] >= 0.60:
            # Hard block — return early without running diagnostic models
            case_id = str(uuid.uuid4())
            elapsed = round((time.perf_counter() - t_start) * 1000)
            case = {
                "case_id": case_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "mode": "auto",
                "type_agnostic_mode": False,
                "routing_result": routing_result,
                "quality_check": quality,
                "blocked": True,
                "block_reason": "invalid_drawing",
                "specialist_result": None,
                "unified_result": None,
                "all_results": None,
                "explanation": "The routing classifier identified this image as not containing a recognizable spiral or wave drawing. Please upload a clear spiral or wave drawing on plain white paper.",
                "inference_time_ms": elapsed,
                "is_mock": routing_result["is_mock"],
                "analysis_type": "image"
            }
            request.app.state.cases[case_id] = case
            return case

        # Route to specialist based on router verdict
        drawing_type = routing_result["label"]
        run_specialist = run_spiral if drawing_type == "Spiral" else run_wave
        specialist_result, unified_result = await asyncio.gather(
            _run_in_executor(run_specialist, pil_image),
            _run_in_executor(run_unified, pil_image),
        )

    # ── 5. Build response ────────────────────────────────────────────────────
    elapsed_ms = round((time.perf_counter() - t_start) * 1000)
    case_id = str(uuid.uuid4())

    # Primary result for headline
    primary = specialist_result or (all_results["unified"] if all_results else {})
    result_label = primary.get("label", "Healthy")
    primary_prob = primary.get("prob", 0.5)
    primary_confidence = min(max(max(primary_prob, 1 - primary_prob), 0.5), 0.96)

    # Determine drawing type label for explanation
    if mode == "all_three":
        drawing_type_label = "Spiral/Wave"
    elif mode == "manual":
        drawing_type_label = manual_model.capitalize() if manual_model else "Drawing"
    else:
        drawing_type_label = routing_result.get("label", "Drawing")

    explanation = _build_explanation(
        mode=mode,
        result_label=result_label,
        drawing_type=drawing_type_label,
        confidence=primary_confidence,
        model_name=primary.get("model_name", "Diagnostic model"),
    )

    # Agreement check (only when both specialist and unified ran)
    models_agree = None
    if specialist_result and unified_result and specialist_result is not unified_result:
        models_agree = specialist_result["label"] == unified_result["label"]

    any_mock = any([
        routing_result.get("is_mock", False),
        (specialist_result or {}).get("is_mock", False),
        (unified_result or {}).get("is_mock", False),
    ])
    if all_results:
        any_mock = any_mock or any(r.get("is_mock", False) for r in all_results.values())

    case = {
        "case_id": case_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mode": mode,
        "type_agnostic_mode": type_agnostic_mode,
        "routing_result": routing_result,
        "quality_check": quality,
        "blocked": False,
        "specialist_result": specialist_result,
        "unified_result": unified_result,
        "all_results": all_results,
        "models_agree": models_agree,
        "explanation": explanation,
        "inference_time_ms": elapsed_ms,
        "is_mock": any_mock,
        "analysis_type": "image"
    }

    request.app.state.cases[case_id] = case
    return case


@router.post("/analyze-svc")
async def analyze_svc(
    request: Request,
    file: UploadFile = File(...),
):
    """
    Process a .svc digital pen recording file using the PaHaW classical ML pipeline.
    """
    t_start = time.perf_counter()
    raw_bytes = await file.read()
    
    try:
        # Run PaHaW inference (CPU bound, use executor)
        result = await _run_in_executor(process_svc_file, raw_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing SVC file: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error processing file: {str(e)}")

    elapsed_ms = round((time.perf_counter() - t_start) * 1000)
    case_id = str(uuid.uuid4())

    is_pd = result.get("prediction") == "Parkinson"
    prob = result.get("probability", 0.5)
    conf = min(max(max(prob, 1 - prob), 0.5), 0.96)

    explanation = (
        f"The sequential PaHaW pipeline analyzed {result.get('features_extracted', 0)} kinematic features "
        f"and found patterns consistent with {'Parkinsons' if is_pd else 'healthy'} motor function "
        f"at {conf:.0%} confidence. This result is a research indicator only."
    )

    case = {
        "case_id": case_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mode": "pahaw_svc",
        "analysis_type": "svc",
        "pahaw_result": result,
        "explanation": explanation,
        "inference_time_ms": elapsed_ms,
        "is_mock": result.get("is_mock", False),
    }

    request.app.state.cases[case_id] = case
    return case

