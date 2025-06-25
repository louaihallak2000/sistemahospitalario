#!/usr/bin/env python3
"""
Script simple para verificar que el backend esté funcionando correctamente
"""

import requests
import json

def test_backend_connection():
    """Probar conexión básica al backend"""
    
    try:
        print("🔍 Probando conexión al backend...")
        
        # Intentar conectar al backend
        response = requests.get("http://localhost:8000/", timeout=5)
        
        if response.status_code == 200:
            print("✅ Backend está corriendo correctamente!")
            print(f"📄 Respuesta: {response.text[:100]}...")
            return True
        else:
            print(f"⚠️  Backend responde pero con código: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al backend")
        print("💡 Sugerencia: Asegúrate de que el backend esté corriendo en puerto 8000")
        return False
        
    except requests.exceptions.Timeout:
        print("❌ Error: Timeout conectando al backend")
        return False
        
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def test_api_endpoints():
    """Probar endpoints específicos de la API"""
    
    print("\n🔍 Probando endpoints de la API...")
    
    endpoints = [
        ("/docs", "Documentación Swagger"),
        ("/health", "Health Check"),
        ("/api/v1/episodios/lista-espera", "Lista de Espera"),
    ]
    
    for endpoint, description in endpoints:
        try:
            print(f"  📡 Probando {description}...")
            response = requests.get(f"http://localhost:8000{endpoint}", timeout=5)
            
            if response.status_code == 200:
                print(f"    ✅ {description} - OK")
            else:
                print(f"    ⚠️  {description} - Código {response.status_code}")
                
        except Exception as e:
            print(f"    ❌ {description} - Error: {e}")

if __name__ == "__main__":
    print("🏥 SISTEMA HOSPITALARIO - VERIFICACIÓN DE CONECTIVIDAD")
    print("=" * 50)
    
    # Probar conexión básica
    backend_ok = test_backend_connection()
    
    if backend_ok:
        # Probar endpoints específicos
        test_api_endpoints()
        
        print("\n✅ RESUMEN:")
        print("   • Backend: FUNCIONANDO")
        print("   • Puerto: 8000")
        print("   • URL: http://localhost:8000")
        print("\n💡 Ahora puedes usar el frontend en http://localhost:3000")
        
    else:
        print("\n❌ PROBLEMA ENCONTRADO:")
        print("   • El backend no está respondiendo")
        print("   • Verifica que esté corriendo: python -m uvicorn app.main:app --reload --port 8000")
        
    print("\n" + "=" * 50) 