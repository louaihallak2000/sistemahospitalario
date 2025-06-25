#!/usr/bin/env python3
"""
Script para iniciar el servidor backend del Sistema Hospitalario
Resuelve NetworkError específicamente
"""

import uvicorn
import sys
import os
import time
from datetime import datetime

def print_banner():
    """Imprime banner informativo"""
    print("=" * 60)
    print("🏥 SISTEMA HOSPITALARIO - BACKEND API")
    print("=" * 60)
    print(f"⏰ Iniciando: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

def print_urls():
    """Imprime URLs importantes"""
    print("🌐 URLs del Sistema:")
    print("   📍 Backend API:    http://127.0.0.1:8000")
    print("   📚 Documentación:  http://127.0.0.1:8000/docs")
    print("   🔧 Health Check:   http://127.0.0.1:8000/health")
    print("   🎯 Endpoint Crítico: http://127.0.0.1:8000/episodios/estadisticos")
    print("   🧪 Test CORS:      http://127.0.0.1:8000/test/episodios")
    print()

def print_credentials():
    """Imprime credenciales de prueba"""
    print("🔐 Credenciales de Prueba:")
    print("   👤 Usuario: admin")
    print("   🔑 Password: admin123")
    print("   🏥 Hospital: HOSP001")
    print()

def check_dependencies():
    """Verifica que las dependencias estén instaladas"""
    try:
        import fastapi
        import uvicorn
        import pydantic
        print("✅ Dependencias verificadas correctamente")
        return True
    except ImportError as e:
        print(f"❌ Error: Dependencia faltante - {e}")
        print("💡 Ejecuta: pip install -r requirements.txt")
        return False

def main():
    """Función principal"""
    print_banner()
    
    # Verificar dependencias
    if not check_dependencies():
        sys.exit(1)
    
    print_urls()
    print_credentials()
    
    print("🚀 Iniciando servidor FastAPI...")
    print("   Presiona Ctrl+C para detener")
    print("=" * 60)
    
    try:
        # Iniciar servidor
        uvicorn.run(
            "main:app",
            host="127.0.0.1",
            port=8000,
            log_level="info",
            reload=True,
            reload_dirs=["."]
        )
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido por el usuario")
    except Exception as e:
        print(f"❌ Error iniciando servidor: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 