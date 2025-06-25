#!/usr/bin/env python3
"""
Test de login con formato correcto - Sistema Hospitalario
Soluciona el error 422 de formato de datos
"""

import requests
import json

def test_login_formats():
    """Probar diferentes formatos de login hasta encontrar el correcto"""
    
    print("🔐 TEST DE LOGIN - FORMATOS CORRECTOS")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Datos de prueba
    test_users = [
        {"username": "dr.martinez", "password": "123456"},
        {"username": "enf.garcia", "password": "123456"},
        {"username": "admin", "password": "admin123"}
    ]
    
    # Endpoints posibles
    endpoints = [
        "/auth/login",
        "/token", 
        "/api/v1/auth/login",
        "/login"
    ]
    
    print("🔍 Probando diferentes formatos de datos...\n")
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        print(f"📡 Endpoint: {endpoint}")
        
        for user in test_users:
            username = user["username"]
            
            # Formato 1: JSON
            try:
                response = requests.post(
                    url,
                    json=user,
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
                
                print(f"   JSON - {username}: Status {response.status_code}")
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        if "access_token" in data:
                            print(f"   ✅ ¡LOGIN EXITOSO! - {username}")
                            print(f"   📄 Formato: JSON")
                            print(f"   🎫 Token: {data['access_token'][:50]}...")
                            print(f"   🔗 URL: {url}")
                            return True
                    except:
                        pass
                elif response.status_code == 422:
                    print(f"   ⚠️  JSON formato incorrecto")
                elif response.status_code == 401:
                    print(f"   🔑 JSON OK - Credenciales incorrectas")
                elif response.status_code == 404:
                    print(f"   ❌ Endpoint no encontrado")
                else:
                    print(f"   ❓ JSON - Error {response.status_code}")
                    
            except requests.exceptions.ConnectionError:
                print(f"   ❌ No se puede conectar al backend")
                return False
            except Exception as e:
                print(f"   ❌ Error JSON: {str(e)[:50]}")
            
            # Formato 2: Form Data (OAuth2)
            try:
                response = requests.post(
                    url,
                    data=user,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=5
                )
                
                print(f"   FORM - {username}: Status {response.status_code}")
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        if "access_token" in data:
                            print(f"   ✅ ¡LOGIN EXITOSO! - {username}")
                            print(f"   📄 Formato: Form Data")
                            print(f"   🎫 Token: {data['access_token'][:50]}...")
                            print(f"   🔗 URL: {url}")
                            return True
                    except:
                        pass
                elif response.status_code == 422:
                    print(f"   ⚠️  Form formato incorrecto")
                elif response.status_code == 401:
                    print(f"   🔑 Form OK - Credenciales incorrectas")
                else:
                    print(f"   ❓ Form - Error {response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ Error Form: {str(e)[:50]}")
        
        print()
    
    print("❌ PROBLEMA: No se encontró formato de login válido")
    return False

def get_user_passwords():
    """Verificar las contraseñas reales en la base de datos"""
    
    print("\n🗄️  VERIFICANDO CONTRASEÑAS EN BASE DE DATOS")
    print("-" * 50)
    
    try:
        import sqlite3
        conn = sqlite3.connect("hospital_db.sqlite")
        cursor = conn.cursor()
        
        # Obtener usuarios y sus hashes de contraseña
        cursor.execute("SELECT username, password_hash, rol FROM usuarios LIMIT 10")
        users = cursor.fetchall()
        
        print("👥 Usuarios en la base de datos:")
        for username, password_hash, rol in users:
            # Mostrar solo parte del hash para seguridad
            hash_preview = password_hash[:20] + "..." if len(password_hash) > 20 else password_hash
            print(f"   • {username} ({rol}) - Hash: {hash_preview}")
        
        conn.close()
        
        # Sugerir contraseñas de prueba
        print("\n💡 SUGERENCIAS:")
        print("   Las contraseñas están hasheadas. Prueba:")
        print("   • Si es un hash simple: '123456', 'password', 'admin'")
        print("   • Si es bcrypt: necesitas saber la contraseña original")
        
    except Exception as e:
        print(f"❌ Error accediendo a BD: {e}")

def main():
    """Función principal"""
    
    print("🏥 DIAGNÓSTICO COMPLETO DE LOGIN")
    print("=" * 60)
    
    # 1. Verificar que el backend esté corriendo
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend está corriendo")
        else:
            print(f"⚠️  Backend responde con código: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Backend no está corriendo")
        print("💡 SOLUCIÓN: Ejecuta 'python iniciar_backend_corregido.py'")
        return
    
    # 2. Probar formatos de login
    login_success = test_login_formats()
    
    # 3. Si no funciona, revisar contraseñas
    if not login_success:
        get_user_passwords()
        
        print("\n🔧 PRÓXIMOS PASOS:")
        print("1. Verificar el endpoint de autenticación en app/api/v1/auth.py")
        print("2. Revisar si las contraseñas están correctamente hasheadas")  
        print("3. Probar con contraseñas conocidas")
        print("4. Verificar la documentación en http://localhost:8000/docs")
    else:
        print("\n🎉 ¡LOGIN FUNCIONANDO CORRECTAMENTE!")

if __name__ == "__main__":
    main() 