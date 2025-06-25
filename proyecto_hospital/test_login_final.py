#!/usr/bin/env python3
"""
🔐 TEST FINAL DE LOGIN - Sistema Hospitalario
Verificación completa de credenciales y funcionalidad del backend
"""

import requests
import json
import sys
from datetime import datetime

def test_backend_status():
    """Test si el backend está respondiendo"""
    print("🔍 VERIFICANDO ESTADO DEL BACKEND...")
    try:
        response = requests.get("http://127.0.0.1:8000", timeout=5)
        if response.status_code == 200:
            print("✅ Backend está ONLINE")
            return True
        else:
            print(f"⚠️ Backend responde con código: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend está OFFLINE - No se puede conectar")
        return False
    except Exception as e:
        print(f"❌ Error verificando backend: {e}")
        return False

def test_login_credentials():
    """Test las credenciales correctas"""
    print("\n🔐 PROBANDO CREDENCIALES CORRECTAS...")
    
    credentials = {
        "hospital_code": "HG001",
        "username": "dr.martinez",
        "password": "medico123"
    }
    
    print(f"📝 Datos enviados: {credentials}")
    
    try:
        response = requests.post(
            "http://127.0.0.1:8000/auth/login",
            json=credentials,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=10
        )
        
        print(f"📡 Response Status: {response.status_code}")
        print(f"📡 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ LOGIN EXITOSO!")
            print(f"🎫 Token recibido: {data.get('access_token', 'NO TOKEN')[:30]}...")
            print(f"👤 Usuario: {data.get('user', {}).get('username', 'NO USER')}")
            return True
        else:
            print(f"❌ LOGIN FALLIDO - Status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📄 Error detalle: {error_data}")
            except:
                print(f"📄 Error texto: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al backend")
        return False
    except Exception as e:
        print(f"❌ Error en request: {e}")
        return False

def test_other_credentials():
    """Test otras credenciales disponibles"""
    print("\n🧪 PROBANDO OTRAS CREDENCIALES...")
    
    other_credentials = [
        {"hospital_code": "HG001", "username": "enf.garcia", "password": "enfermera123"},
        {"hospital_code": "HG001", "username": "enf.lopez", "password": "enfermera123"}
    ]
    
    for cred in other_credentials:
        print(f"\n🔍 Probando: {cred['username']}")
        try:
            response = requests.post(
                "http://127.0.0.1:8000/auth/login",
                json=cred,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"✅ {cred['username']} - LOGIN EXITOSO")
            else:
                print(f"❌ {cred['username']} - LOGIN FALLIDO ({response.status_code})")
        except Exception as e:
            print(f"❌ {cred['username']} - ERROR: {e}")

def main():
    print("=" * 60)
    print("🏥 SISTEMA HOSPITALARIO - TEST LOGIN FINAL")
    print(f"⏰ Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # 1. Verificar backend
    backend_ok = test_backend_status()
    if not backend_ok:
        print("\n❌ BACKEND NO DISPONIBLE")
        print("💡 Solución: Ejecutar 'INICIAR_SISTEMA_HOSPITALARIO.bat'")
        sys.exit(1)
    
    # 2. Probar credenciales principales
    login_ok = test_login_credentials()
    
    # 3. Probar otras credenciales
    test_other_credentials()
    
    # 4. Resumen final
    print("\n" + "=" * 60)
    print("📋 RESUMEN FINAL:")
    print(f"🔧 Backend: {'✅ ONLINE' if backend_ok else '❌ OFFLINE'}")
    print(f"🔐 Login Principal: {'✅ FUNCIONA' if login_ok else '❌ FALLA'}")
    
    if login_ok:
        print("\n🎉 TODO ESTÁ FUNCIONANDO CORRECTAMENTE!")
        print("💡 Usar estas credenciales en el frontend:")
        print("   • Hospital: HG001 - Hospital General San Juan")
        print("   • Usuario: dr.martinez")
        print("   • Contraseña: medico123")
    else:
        print("\n⚠️ HAY PROBLEMAS CON EL LOGIN")
        print("💡 Verificar la base de datos y contraseñas")
    
    print("=" * 60)

if __name__ == "__main__":
    main() 