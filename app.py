"""
Root Application Entry Point for Jal Setu.

Exposes the FastAPI `app` instance for cloud runners such as:
    uvicorn app:app --host 0.0.0.0 --port $PORT
"""

import sys
import os

# Ensure backend directory is in sys.path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
