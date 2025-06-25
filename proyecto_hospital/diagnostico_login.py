#!/usr/bin/env python3
"""
Diagnóstico de problemas de LOGIN - Sistema Hospitalario
"""

import sys
import os
import requests
import json
import time

def diagnosticar_login():
    """Diagnosticar problemas de login paso a paso"""
    
    print("🔒 DIAGNÓSTICO DE LOGIN - SISTEMA HOSPITALARIO")
    print("=" * 60)
    
    # 1. Verificar estructura básica
    print("\n1. 🔍 VERIFICANDO ESTRUCTURA...")
    
    if not os.path.exists("app"):
        print("❌ ERROR: Carpeta 'app' no encontrada")
        return False
        
    if not os.path.exists("app/main.py"):
        print("❌ ERROR: app/main.py no encontrado")
        return False
        
    if not os.path.exists("hospital_db.sqlite"):
        print("❌ ERROR: Base de datos no encontrada")
        print("💡 SOLUCIÓN: Ejecuta 'python crear_datos_ejemplo.py'")
        return False
        
    print("✅ Estructura básica correcta")
    
    # 2. Verificar base de datos
    print("\n2. 🗄️  VERIFICANDO BASE DE DATOS...")
    
    try:
        import sqlite3
        conn = sqlite3.connect("hospital_db.sqlite")
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            print("❌ ERROR: No hay usuarios en la base de datos")
            print("💡 SOLUCIÓN: Ejecuta 'python crear_datos_ejemplo.py'")
            conn.close()
            return False
            
        # Mostrar usuarios disponibles
        cursor.execute("SELECT username, rol FROM usuarios LIMIT 5")
        users = cursor.fetchall()
        
        print(f"✅ Base de datos OK - {user_count} usuarios encontrados:")
        for username, rol in users:
            print(f"   • {username} ({rol})")
            
        conn.close()
        
    except Exception as e:
        print(f"❌ ERROR accediendo a BD: {e}")
        return False
    
    # 3. Verificar backend
    print("\n3. 🚀 VERIFICANDO BACKEND...")
    
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend respondiendo correctamente")
        else:
            print(f"⚠️  Backend responde con código: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Backend no está corriendo")
        print("💡 SOLUCIÓN: Ejecuta el backend con:")
        print("   python -m uvicorn app.main:app --reload --port 8000")
        return False
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False
    
    # 4. Probar endpoint de login
    print("\n4. 🔐 PROBANDO ENDPOINT DE LOGIN...")
    
    # Endpoints posibles de login
    login_urls = [
        "http://localhost:8000/token",
        "http://localhost:8000/api/v1/auth/login",
        "http://localhost:8000/auth/login"
    ]
    
    login_url = None
    for url in login_urls:
        try:
            # Probar con datos de prueba
            response = requests.post(
                url,
                data={"username": "test", "password": "test"},
                timeout=5
            )
            
            if response.status_code != 404:
                login_url = url
                print(f"✅ Endpoint de login encontrado: {url}")
                break
                
        except:
            continue
    
    if not login_url:
        print("❌ ERROR: No se encontró endpoint de login")
        return False
    
    # 5. Probar credenciales reales
    print("\n5. 🔑 PROBANDO CREDENCIALES...")
    
    test_users = [
        {"username": "dr.martinez", "password": "123456"},
        {"username": "enf.garcia", "password": "123456"},
        {"username": "admin", "password": "admin"}
    ]
    
    for user in test_users:
        try:
            response = requests.post(
                login_url,
                data=user,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=5
            )
            
            print(f"   {user['username']}: Status {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "access_token" in data:
                        print(f"   ✅ LOGIN EXITOSO para {user['username']}")
                        print(f"   Token recibido: {data['access_token'][:50]}...")
                        return True
                except:
                    pass
            elif response.status_code == 401:
                print(f"   ⚠️  Credenciales incorrectas")
            else:
                print(f"   ❌ Error: {response.text[:100]}")
                
        except Exception as e:
            print(f"   ❌ Error probando {user['username']}: {e}")
    
    print("\n❌ PROBLEMA DETECTADO: Login no funciona")
    print("\n🛠️  SOLUCIONES:")
    print("1. Verificar contraseñas de usuarios en la base de datos")
    print("2. Revisar configuración de hash de contraseñas")
    print("3. Verificar endpoint de autenticación")
    
    return False

def main():
    """Función principal"""
    try:
        if diagnosticar_login():
            print("\n🎉 ¡LOGIN FUNCIONANDO CORRECTAMENTE!")
        else:
            print("\n🔧 Login requiere corrección")
    except KeyboardInterrupt:
        print("\n\n⏹️  Diagnóstico interrumpido")
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")

if __name__ == "__main__":
    main() 