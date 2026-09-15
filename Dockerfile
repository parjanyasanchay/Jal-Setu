# =========================================================================
# Multi-stage Dockerfile for Jal Setu (Watershed GIS Assessment Platform)
# Stage 1: Frontend Build (Node.js)
# Stage 2: Production Web Service (Python / FastAPI + Uvicorn)
# =========================================================================

# --- Stage 1: Frontend Asset Compilation ---
FROM node:20-alpine AS frontend-builder
WORKDIR /build

# Copy dependency specifications first for Docker layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source files and compile production bundle
COPY index.html portal.html auth.html map.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build


# --- Stage 2: Production Runtime ---
FROM python:3.11-slim AS runner
WORKDIR /app

# Install system dependencies required for PostgreSQL/PostGIS libraries & health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend ./backend
COPY app.py ./

# Copy compiled frontend assets from Stage 1 into /app/dist
COPY --from=frontend-builder /build/dist ./dist

# Create upload directory and set up non-root security context
RUN mkdir -p /app/uploads/evidence && \
    useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Environment defaults
ENV PYTHONUNBUFFERED=1 \
    PORT=8000 \
    UPLOAD_DIR=/app/uploads/evidence

EXPOSE 8000

# Container health monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start the permanent cloud server
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"]
