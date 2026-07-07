FROM python:3.11-slim

# Install system dependencies for OpenCV + Node.js for frontend build
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxrender1 libxext6 libgl1-mesa-glx \
    curl ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Python dependencies ─────────────────────────────────────────
COPY backend/requirements.txt /app/requirements.txt
COPY hf_space/requirements_hf.txt /app/requirements_hf.txt
RUN pip install --no-cache-dir -r requirements.txt -r requirements_hf.txt

# ── Build React frontend ────────────────────────────────────────
COPY frontend /app/frontend
WORKDIR /app/frontend
RUN npm install --frozen-lockfile && npm run build

# ── Copy backend + built frontend ──────────────────────────────
WORKDIR /app
COPY backend /app/backend
COPY hf_space/app.py /app/app.py

# Copy built React output into static serving dir
RUN mkdir -p /app/hf_space/static && cp -r /app/frontend/dist/* /app/hf_space/static/

# Create models directory (models downloaded at runtime from HF Hub)
RUN mkdir -p /app/hf_space/models

# ── HF Spaces port is 7860 ──────────────────────────────────────
EXPOSE 7860

ENV PYTHONPATH=/app
WORKDIR /app/hf_space

CMD ["python", "app.py"]
