#!/usr/bin/env python3
"""
Script simple para iniciar el backend
"""

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("🚀 Iniciando servidor FastAPI...")
    print("📍 URL: http://127.0.0.1:8000")
    print("📚 Docs: http://127.0.0.1:8000/docs")
    print("=" * 50)
    
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info",
        reload=True
    ) 