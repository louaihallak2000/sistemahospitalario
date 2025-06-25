#!/usr/bin/env python3
"""
Script para iniciar el backend correctamente
Soluciona problemas de importación del módulo 'app'
"""

import os
import sys
import subprocess
import time

def iniciar_backend():
    """Iniciar el backend FastAPI correctamente"""
    
    print("🚀 INICIANDO BACKEND SISTEMA HOSPITALARIO")
    print("=" * 50)
    
    # 1. Verificar que estamos en el directorio correcto
    if not os.path.exists("app"):
        print("❌ ERROR: No se encuentra la carpeta 'app'")
        print("💡 Ejecuta este script desde la carpeta 'proyecto_hospital'")
        return False
    
    if not os.path.exists("app/main.py"):
        print("❌ ERROR: No se encuentra app/main.py")
        return False
    
    print("✅ Estructura del proyecto verificada")
    
    # 2. Asegurar que tenemos las dependencias
    print("\n📦 Verificando dependencias...")
    
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        print("✅ Dependencias principales encontradas")
    except ImportError as e:
        print(f"❌ ERROR: Falta dependencia - {e}")
        print("💡 SOLUCIÓN: pip install fastapi uvicorn sqlalchemy")
        return False
    
    # 3. Verificar base de datos
    if not os.path.exists("hospital_db.sqlite"):
        print("\n🗄️  Base de datos no encontrada - creando datos de ejemplo...")
        try:
            subprocess.run([sys.executable, "crear_datos_ejemplo.py"], check=True)
            print("✅ Base de datos creada con datos de ejemplo")
        except subprocess.CalledProcessError:
            print("❌ ERROR: No se pudo crear la base de datos")
            return False
    else:
        print("✅ Base de datos encontrada")
    
    # 4. Configurar el entorno Python
    print("\n🔧 Configurando entorno...")
    
    # Agregar el directorio actual al PYTHONPATH
    current_dir = os.getcwd()
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    
    # Establecer variable de entorno
    os.environ["PYTHONPATH"] = current_dir
    
    print(f"✅ PYTHONPATH configurado: {current_dir}")
    
    # 5. Iniciar el servidor
    print("\n🔥 Iniciando servidor FastAPI...")
    print("   Puerto: 8000")
    print("   Host: 0.0.0.0")
    print("   Modo: Desarrollo (reload activado)")
    print("   Acceso: http://localhost:8000")
    print("   Docs: http://localhost:8000/docs")
    print("")
    print("⏳ Iniciando... (presiona Ctrl+C para detener)")
    print("-" * 50)
    
    try:
        # Usar uvicorn directamente
        import uvicorn
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            reload_dirs=[current_dir],
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\n🛑 Backend detenido por el usuario")
        return True
    except Exception as e:
        print(f"\n❌ ERROR iniciando el backend: {e}")
        return False

def main():
    """Función principal"""
    try:
        iniciar_backend()
    except KeyboardInterrupt:
        print("\n\n⏹️  Inicio cancelado por el usuario")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")

if __name__ == "__main__":
    main() 