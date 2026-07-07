"""
app.py — NeuroDraw FastAPI application.

Loads all models once at startup via lifespan context manager.
Maintains in-memory case history (resets on restart per spec Section 9).
"""

import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models at startup; clean up on shutdown."""
    logger.info("NeuroDraw API starting — loading models...")

    from inference.router import load_router
    from inference.vgg16_models import load_vgg16_models
    from inference.pahaw_pipeline import load_pahaw

    router_real = load_router()
    vgg_status = load_vgg16_models()
    pahaw_real = load_pahaw()

    app.state.models_loaded = {
        "router": router_real,
        "spiral": vgg_status.get("spiral", False),
        "wave": vgg_status.get("wave", False),
        "unified": vgg_status.get("unified", False),
        "pahaw": pahaw_real,
    }
    app.state.any_mock = not all(app.state.models_loaded.values())

    # In-memory case store: {case_id: case_dict}
    app.state.cases: dict[str, dict] = {}

    logger.info(
        "Models loaded: %s (any_mock=%s)",
        app.state.models_loaded,
        app.state.any_mock,
    )
    yield
    logger.info("NeuroDraw API shutting down.")


app = FastAPI(
    title="NeuroDraw API",
    description="Parkinson's Disease Handwriting Analysis Research Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
from api.analyze import router as analyze_router
from api.cases import router as cases_router
from api.metrics import router as metrics_router
from api.reports import router as reports_router

app.include_router(analyze_router, prefix="/api")
app.include_router(cases_router, prefix="/api")
app.include_router(metrics_router, prefix="/api")
app.include_router(reports_router, prefix="/api")


@app.get("/", tags=["health"])
async def health_check():
    """API health check with model load status."""
    return {
        "status": "ok",
        "service": "NeuroDraw API",
        "version": "1.0.0",
        "models_loaded": app.state.models_loaded,
        "any_mock": app.state.any_mock,
        "note": (
            "Some models running in mock mode — drop .keras files into backend/models/ for real inference"
            if app.state.any_mock
            else "All models loaded and ready"
        ),
    }
