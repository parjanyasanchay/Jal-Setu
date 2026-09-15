# Jal Setu — Watershed GIS Assessment Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker Ready](https://img.shields.io/badge/Docker-Multi--stage%20Build-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![PostgreSQL & PostGIS](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20PostGIS-336791?logo=postgresql&logoColor=white)](https://postgis.net)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://vitejs.dev)

**Jal Setu** is an officer decision-support platform that connects satellite earth observation (Sentinel-2 L2A), GIS watershed boundaries, and geo-tagged field photography to monitor watershed conservation interventions across India (PMKSY-WDC, Sujala, Tarun Bharat Sangh, Neeranchal).

> **Important Notice on Data & Satellite Resolution:**
> - National watershed benchmark records (e.g., Waghad, Kadwa, Darna, Ralegan Siddhi) are **prototype / sample data** configured for demonstration and officer review simulation.
> - Satellite observations are supporting evidence, **not proof that an individual intervention caused an environmental change**. At 30-metre resolution, small check dams, farm ponds, trenches, and bunds are not individually resolvable.
> - Official portals and attribution: [ISRO Bhuvan 2D Geoportal](https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php) and [DoLR IWMP–SRISHTI Geoportal](https://bhuvan-panchayat3.nrsc.gov.in/).

---

## Key Features

1. **National Watershed GIS Explorer**: Interactive Leaflet maps across 8 Indian States and 16 Districts with priority indices, rainfall, NDVI, and Water Index (NDWI).
2. **Evidence Fusion Engine**: Transparent rule-based assessment combining field photos, EXIF GPS, GIS context, and satellite overpass data into *Verified*, *Needs Review*, or *Inconclusive* statuses.
3. **Adaptive Survey Planner**: Prioritizes field inspections based on evidence gap and catchment priority so officers know where to inspect first.
4. **Field Evidence Register**: Upload and inspect geo-tagged field photos with EXIF metadata parsing.
5. **“Ask Jal Setu” Grounded AI Chatbot**: Explains monitoring results in simple English or Hindi without hallucinating values, backed by a graceful offline fallback if local Ollama or cloud LLMs are unreachable.
6. **Unified Cloud-Ready Architecture**: Multi-stage Docker container serving both the FastAPI REST API and compiled React dashboard.

---

## Environment Variables Reference

Configure these variables in your deployment dashboard (e.g., Render, Railway, Fly.io) or in a local `.env` file (copied from `.env.example`):

| Variable | Description | Default / Example | Required in Production |
| :--- | :--- | :--- | :---: |
| `PORT` | Web server listening port | `8000` | Yes (Render provides automatically) |
| `SECRET_KEY` | Cryptographic secret for tokens and session security | A 32+ character random string | **Yes** |
| `DATABASE_URL` | Managed PostgreSQL/PostGIS connection string | `sqlite:///backend/parjanya.db` | **Yes** for cloud (SQLite fallback for local) |
| `ALLOWED_HOSTS` | Comma-separated list of trusted host headers | `*` (or e.g. `jalsetu.onrender.com`) | Recommended |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | `*` (or e.g. `https://jalsetu.onrender.com`) | Recommended |
| `PUBLIC_BASE_URL` | The public HTTPS URL where this service is reachable | `https://jalsetu.onrender.com` | Recommended |
| `LLM_PROVIDER` | AI provider for chatbot: `ollama` or `openai` | `ollama` | Optional |
| `LLM_API_KEY` | API key if using hosted OpenAI-compatible provider | `sk-...` | Optional |
| `OLLAMA_BASE_URL` | Local Ollama base URL | `http://localhost:11434` | Optional |
| `OLLAMA_MODEL` | Local Ollama model name | `llama3.2` | Optional |
| `UPLOAD_DIR` | Storage directory for geo-tagged field photos | `/app/uploads/evidence` | Optional |

> **Security Reminder:** Never commit real `.env` files or API keys into version control.

---

## Permanent Cloud Deployment Guide

### Option 1: One-Click Deployment via Render Blueprint (`render.yaml`)

This project includes a native Render Blueprint specification (`render.yaml`) that automatically provisions:
- A managed **PostgreSQL** database (PostGIS-ready)
- A unified **Docker** web service running FastAPI and the compiled React dashboard

#### Steps:
1. Push this repository to GitHub or GitLab.
2. Sign in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Blueprint**.
4. Connect this repository. Render will automatically read `render.yaml`.
5. Click **Apply**. Render will:
   - Provision the PostgreSQL database `jalsetu-db`
   - Build the Docker container using `Dockerfile` (compiling the frontend and installing Python dependencies)
   - Automatically inject `DATABASE_URL` and generate `SECRET_KEY`
   - Run health checks against `/health`
6. Once the build completes, test the provided `https://<your-app>.onrender.com` URL.

---

### Option 2: Manual Docker Deployment (Render, Railway, Fly.io, AWS, DigitalOcean)

#### 1. Build the Docker Image:
```bash
docker build -t jalsetu-mvp:latest .
```

#### 2. Run the Container Locally:
```bash
docker run -d \
  -p 8000:8000 \
  -e SECRET_KEY="your-random-secret-key-32-chars-long" \
  -e DATABASE_URL="sqlite:///backend/parjanya.db" \
  -e ALLOWED_HOSTS="*" \
  -e ALLOWED_ORIGINS="*" \
  --name jalsetu-app \
  jalsetu-mvp:latest
```

#### 3. Test Container Health:
```bash
curl -f http://localhost:8000/health
```

---

## Database Configuration & PostGIS Support

- **Automatic SQLite Fallback**: If `DATABASE_URL` is omitted, Jal Setu uses local SQLite (`parjanya.db`) for zero-friction local exploration.
- **PostgreSQL / PostGIS**: In production, set `DATABASE_URL=postgresql://user:password@host:5432/dbname`.
- **URL Normalization**: Handles Render/Heroku `postgres://` URLs automatically, rewriting them to `postgresql://` for SQLAlchemy 2.0 compatibility.
- **PostGIS Activation**: When connected to PostgreSQL, Jal Setu automatically executes `CREATE EXTENSION IF NOT EXISTS postgis;` if permissions allow.
- **Auto-Seeding**: On first run against an empty PostgreSQL database, the schema and all 23 national benchmark watersheds are automatically seeded.

---

## Storage & Photograph Uploads

- **Storage Limitation**: In standard containerized environments without a persistent volume disk, files saved to `/app/uploads` are stored in ephemeral container storage.
- **Production Persistence**: On persistent hosting (Render Starter+, AWS EBS, or Kubernetes PVC), mount a persistent disk at `/app/uploads/evidence` to preserve field photographs across container redeployments.

---

## Local Development Setup

### 1. Backend Server:
```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Or from the workspace root using the cloud entry point:
```powershell
.\backend\venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Server:
```bash
npm run dev
```
Open `http://localhost:5173/portal.html` or `http://localhost:5173/dashboard`.

### Default Demo Credentials:
- **Email:** `officer@jalsetu.gov.in`
- **Password:** `JalSetu@2026`

---

## Running Automated Tests

Run the complete test suite (12 tests covering chatbot grounding, Hindi/English responses, offline fallback, `/health` check, database migrations, and production redirects):

```powershell
.\backend\venv\Scripts\python.exe -m pytest backend/tests/ -v
```

---

## Troubleshooting

- **Database Connection Failure**: Check that your `DATABASE_URL` format begins with `postgresql://` and that network firewalls/SSL modes allow the web service to reach the database host.
- **CORS Errors**: Ensure `ALLOWED_ORIGINS` includes the scheme and domain of your frontend (e.g. `https://jalsetu.onrender.com`).
- **Ollama Offline in Cloud**: When running in the cloud without a local Ollama instance, the chatbot automatically uses the built-in **RuleBasedExplainer** fallback. It delivers accurate, 4-part structured responses in English or Hindi without returning an error.
- **Login Redirects**: Successful login automatically routes to `/dashboard`, which loads the officer decision workspace.
