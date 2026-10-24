"""Entrypoint script to start the Qubit Quest FastAPI backend on port 4285."""

import os
import uvicorn


if __name__ == "__main__":
    host = os.getenv("BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("BACKEND_PORT", "4285"))
    reload_enabled = os.getenv("BACKEND_RELOAD", "false").lower() == "true"

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload_enabled,
        app_dir=os.path.dirname(os.path.abspath(__file__)),
    )
