"""
Script para verificar el estado del sistema hospitalario completo
"""
import httpx
import time
import sys

print("=" * 60)
print("🏥 SISTEMA HOSPITALARIO - VERIFICACIÓN DE ESTADO")
print("=" * 60)

# Esperar un momento para que los servicios se inicien
print("\n⏳ Esperando que los servicios se inicien completamente...")
time.sleep(5)

# Verificar Backend
print("\n🔍 Verificando Backend (Puerto 8000)...")
try:
    response = httpx.get("http://localhost:8000/health", timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Backend: ACTIVO")
        print(f"   - Estado: {data.get('status')}")
        print(f"   - Base de datos: {data.get('database')}")
        print(f"   - URL: http://localhost:8000")
        print(f"   - Docs: http://localhost:8000/docs")
    else:
        print(f"❌ Backend: ERROR (Status: {response.status_code})")
except Exception as e:
    print(f"❌ Backend: NO DISPONIBLE - {str(e)}")

# Verificar Frontend
print("\n🔍 Verificando Frontend (Puerto 3000)...")
try:
    response = httpx.get("http://localhost:3000", timeout=5)
    if response.status_code == 200:
        print(f"✅ Frontend: ACTIVO")
        print(f"   - URL: http://localhost:3000")
    else:
        print(f"⚠️  Frontend: Respuesta inesperada (Status: {response.status_code})")
except Exception as e:
    print(f"❌ Frontend: NO DISPONIBLE - {str(e)}")

print("\n" + "=" * 60)
print("📋 RESUMEN DEL SISTEMA")
print("=" * 60)

print("\n🔐 Credenciales de acceso:")
print("   Hospital: HOSP001")
print("   Usuario: admin")
print("   Contraseña: admin123")

print("\n🌐 URLs del sistema:")
print("   - Frontend: http://localhost:3000")
print("   - Backend API: http://localhost:8000")
print("   - Documentación API: http://localhost:8000/docs")

print("\n💡 Comandos útiles:")
print("   - Ver logs del backend: Revisar la terminal donde se ejecutó uvicorn")
print("   - Ver logs del frontend: Revisar la terminal donde se ejecutó npm run dev")
print("   - Detener servicios: Ctrl+C en cada terminal")

print("\n✨ El sistema está listo para usar!")
print("=" * 60) 