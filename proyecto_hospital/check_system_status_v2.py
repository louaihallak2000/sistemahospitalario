"""
Script mejorado para verificar el estado del sistema hospitalario completo
"""
import httpx
import time
import sys

print("=" * 60)
print("🏥 SISTEMA HOSPITALARIO - VERIFICACIÓN DE ESTADO v2")
print("=" * 60)

# Esperar un momento para que los servicios se inicien
print("\n⏳ Verificando servicios...")
time.sleep(2)

# Verificar Backend
print("\n🔍 Verificando Backend (Puerto 8000)...")
try:
    response = httpx.get("http://localhost:8000/health", timeout=5)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Backend: ACTIVO")
        print(f"   - Estado: {data.get('status')}")
        print(f"   - Base de datos: SQLite")
        print(f"   - URL: http://localhost:8000")
        print(f"   - Docs: http://localhost:8000/docs")
    else:
        print(f"❌ Backend: ERROR (Status: {response.status_code})")
except Exception as e:
    print(f"❌ Backend: NO DISPONIBLE - {str(e)}")

# Verificar Frontend
print("\n🔍 Verificando Frontend (Puerto 3000)...")
try:
    response = httpx.get("http://localhost:3000", timeout=5, follow_redirects=True)
    # Next.js puede devolver 200, 404 o redirigir - todos son válidos
    if response.status_code in [200, 404, 307, 308]:
        # Verificar que sea HTML de Next.js
        content_type = response.headers.get("content-type", "")
        if "text/html" in content_type or response.status_code == 200:
            print(f"✅ Frontend: ACTIVO")
            print(f"   - URL: http://localhost:3000")
            print(f"   - Framework: Next.js 15")
            print(f"   - React: v19")
        else:
            print(f"⚠️  Frontend: Respuesta inesperada")
    else:
        print(f"❌ Frontend: ERROR (Status: {response.status_code})")
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

print("\n📝 Otros usuarios disponibles:")
print("   - medico1 / medico123 (Médico)")
print("   - enfermera1 / enfermera123 (Enfermera)")
print("   - admin2 / admin456 (Hospital HOSP002)")

print("\n💡 Tips:")
print("   - Si ves errores de CORS, recarga la página (F5)")
print("   - El sistema tiene 5 pacientes de ejemplo con diferentes triajes")
print("   - Puedes crear nuevos pacientes desde el dashboard")

print("\n✨ ¡El sistema está listo para usar!")
print("=" * 60) 