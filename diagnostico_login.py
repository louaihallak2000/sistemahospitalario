#!/usr/bin/env python3
"""
Diagnóstico específico para problemas de LOGIN del Sistema Hospitalario
Este script identifica y corrige problemas comunes de autenticación
"""

import sys
import os
import requests
import json
import subprocess
import time
from pathlib import Path

def print_header():
    """Mostrar header del diagnóstico"""
    print("=" * 80)
    print("🔒 DIAGNÓSTICO DE PROBLEMAS DE LOGIN - SISTEMA HOSPITALARIO")
    print("=" * 80)
    print()

def check_python_path():
    """Verificar que Python puede importar el módulo app"""
    print("🔍 VERIFICANDO IMPORTACIONES DE PYTHON...")
    print("-" * 50)
    
    try:
        # Verificar que estamos en el directorio correcto
        if not os.path.exists("app"):
            print("❌ ERROR: No se encuentra la carpeta 'app'")
            print("💡 SOLUCIÓN: Ejecuta este script desde la carpeta 'proyecto_hospital'")
            return False
            
        # Verificar que app es un módulo válido
        if not os.path.exists("app/__init__.py"):
            print("❌ ERROR: 'app' no es un módulo Python válido")
            print("💡 SOLUCIÓN: Falta el archivo app/__init__.py")
            return False
            
        # Verificar que main.py existe
        if not os.path.exists("app/main.py"):
            print("❌ ERROR: No se encuentra app/main.py")
            print("💡 SOLUCIÓN: El archivo principal del backend no existe")
            return False
            
        print("✅ Estructura de módulos correcta")
        
        # Intentar importar el módulo
        sys.path.insert(0, os.getcwd())
        try:
            import app.main
            print("✅ Módulo 'app.main' importado correctamente")
            return True
        except ImportError as e:
            print(f"❌ ERROR importando app.main: {e}")
            print("💡 SOLUCIÓN: Revisa las dependencias en requirements.txt")
            return False
            
    except Exception as e:
        print(f"❌ ERROR inesperado: {e}")
        return False

def check_database():
    """Verificar que la base de datos existe y tiene usuarios"""
    print("\n🗄️  VERIFICANDO BASE DE DATOS...")
    print("-" * 50)
    
    try:
        if not os.path.exists("hospital_db.sqlite"):
            print("❌ ERROR: Base de datos no encontrada")
            print("💡 SOLUCIÓN: Ejecuta 'python crear_datos_ejemplo.py'")
            return False
            
        # Verificar que la base de datos tiene contenido
        try:
            import sqlite3
            conn = sqlite3.connect("hospital_db.sqlite")
            cursor = conn.cursor()
            
            # Verificar tabla usuarios
            cursor.execute("SELECT COUNT(*) FROM usuarios")
            user_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM hospitales")
            hospital_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM pacientes") 
            patient_count = cursor.fetchone()[0]
            
            conn.close()
            
            print(f"✅ Base de datos encontrada:")
            print(f"   • {user_count} usuarios")
            print(f"   • {hospital_count} hospitales")
            print(f"   • {patient_count} pacientes")
            
            if user_count == 0:
                print("⚠️  WARNING: No hay usuarios en la base de datos")
                print("💡 SOLUCIÓN: Ejecuta 'python crear_datos_ejemplo.py'")
                return False
                
            return True
            
        except Exception as e:
            print(f"❌ ERROR accediendo a la base de datos: {e}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR inesperado: {e}")
        return False

def start_backend_test():
    """Iniciar el backend en modo de prueba"""
    print("\n🚀 INICIANDO BACKEND EN MODO PRUEBA...")
    print("-" * 50)
    
    try:
        # Cambiar al directorio correcto
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Comando para iniciar el backend
        cmd = [
            sys.executable, "-m", "uvicorn", "app.main:app", 
            "--host", "0.0.0.0", "--port", "8000", "--no-access-log"
        ]
        
        print("🔄 Ejecutando:", " ".join(cmd))
        
        # Iniciar el proceso en background
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Esperar un poco para que inicie
        print("⏳ Esperando que el backend inicie...")
        time.sleep(5)
        
        # Verificar si el proceso sigue corriendo
        if process.poll() is None:
            print("✅ Backend iniciado correctamente")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ ERROR: Backend falló al iniciar")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ ERROR iniciando backend: {e}")
        return None

def test_login_endpoint():
    """Probar el endpoint de login específicamente"""
    print("\n🔒 PROBANDO ENDPOINT DE LOGIN...")
    print("-" * 50)
    
    # URLs a probar
    base_url = "http://localhost:8000"
    login_endpoints = [
        "/token",
        "/api/v1/auth/login", 
        "/auth/login",
        "/login"
    ]
    
    # Datos de prueba
    test_credentials = [
        {"username": "dr.martinez", "password": "test123"},
        {"username": "enf.garcia", "password": "test123"},
        {"username": "admin", "password": "admin123"}
    ]
    
    try:
        # Primero verificar que el backend responde
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code != 200:
            print(f"❌ ERROR: Backend no responde correctamente (Status: {response.status_code})")
            return False
            
        print("✅ Backend responde correctamente")
        
        # Probar endpoints de documentación
        docs_response = requests.get(f"{base_url}/docs", timeout=5)
        if docs_response.status_code == 200:
            print("✅ Documentación Swagger accesible")
        
        # Buscar el endpoint de login correcto
        login_endpoint = None
        for endpoint in login_endpoints:
            try:
                # Probar con POST
                response = requests.post(
                    f"{base_url}{endpoint}",
                    data={"username": "test", "password": "test"},
                    timeout=5
                )
                
                if response.status_code != 404:
                    login_endpoint = endpoint
                    print(f"✅ Endpoint de login encontrado: {endpoint}")
                    break
                    
            except requests.exceptions.RequestException:
                continue
                
        if not login_endpoint:
            print("❌ ERROR: No se encontró endpoint de login válido")
            print("💡 SOLUCIÓN: Verificar las rutas de autenticación en el backend")
            return False
            
        # Probar login con credenciales de prueba
        print(f"\n🔑 Probando credenciales en {login_endpoint}...")
        
        for creds in test_credentials:
            try:
                response = requests.post(
                    f"{base_url}{login_endpoint}",
                    data=creds,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                    timeout=5
                )
                
                print(f"   Usuario: {creds['username']} - Status: {response.status_code}")
                
                if response.status_code == 200:
                    try:
                        token_data = response.json()
                        if "access_token" in token_data:
                            print(f"   ✅ Login exitoso - Token recibido")
                            return True
                    except:
                        pass
                elif response.status_code == 401:
                    print(f"   ⚠️  Credenciales incorrectas")
                else:
                    print(f"   ❌ Error inesperado: {response.text[:100]}")
                    
            except requests.exceptions.RequestException as e:
                print(f"   ❌ Error de conexión: {e}")
                
        print("\n❌ PROBLEMA: Ninguna credencial de prueba funcionó")
        print("💡 SOLUCIONES:")
        print("   1. Verificar que los usuarios existen en la base de datos")
        print("   2. Verificar el sistema de hash de contraseñas")
        print("   3. Revisar la configuración de autenticación")
        
        return False
        
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: No se puede conectar al backend")
        print("💡 SOLUCIÓN: Asegúrate de que el backend esté corriendo en puerto 8000")
        return False
        
    except Exception as e:
        print(f"❌ ERROR inesperado: {e}")
        return False

def generate_solution():
    """Generar soluciones específicas basadas en los problemas encontrados"""
    print("\n🛠️  SOLUCIONES RECOMENDADAS:")
    print("=" * 80)
    
    solutions = [
        {
            "problema": "ModuleNotFoundError: No module named 'app'",
            "solucion": [
                "1. Asegúrate de estar en el directorio 'proyecto_hospital'",
                "2. Activa el entorno virtual: .venv\\Scripts\\activate",
                "3. Instala dependencias: pip install -r requirements.txt",
                "4. Ejecuta: python -m uvicorn app.main:app --reload"
            ]
        },
        {
            "problema": "Error de login - Credenciales incorrectas",
            "solucion": [
                "1. Ejecuta: python crear_datos_ejemplo.py",
                "2. Usuarios de prueba:",
                "   • dr.martinez (médico)",
                "   • enf.garcia (enfermera)",
                "   • enf.lopez (enfermera)",
                "3. Las contraseñas por defecto necesitan configurarse"
            ]
        },
        {
            "problema": "Backend no inicia",
            "solucion": [
                "1. Verifica Python: python --version",
                "2. Instala dependencias: pip install fastapi uvicorn sqlalchemy",
                "3. Verifica estructura: app/main.py debe existir",
                "4. Revisa logs de error en la ventana del backend"
            ]
        }
    ]
    
    for sol in solutions:
        print(f"\n🔧 {sol['problema']}")
        print("-" * 60)
        for step in sol['solucion']:
            print(f"   {step}")

def main():
    """Función principal del diagnóstico"""
    print_header()
    
    all_checks_passed = True
    backend_process = None
    
    try:
        # 1. Verificar importaciones
        if not check_python_path():
            all_checks_passed = False
            
        # 2. Verificar base de datos
        if not check_database():
            all_checks_passed = False
            
        # 3. Si las verificaciones básicas pasan, probar el backend
        if all_checks_passed:
            backend_process = start_backend_test()
            
            if backend_process:
                # 4. Probar login específicamente
                if test_login_endpoint():
                    print("\n🎉 ¡DIAGNÓSTICO EXITOSO! El sistema de login funciona correctamente.")
                else:
                    all_checks_passed = False
            else:
                all_checks_passed = False
                
        # 5. Generar soluciones si hay problemas
        if not all_checks_passed:
            generate_solution()
            
            print("\n📋 PRÓXIMOS PASOS:")
            print("-" * 40)
            print("1. Aplicar las soluciones recomendadas")
            print("2. Ejecutar nuevamente este diagnóstico")
            print("3. Si persisten problemas, revisar logs detallados")
            
    finally:
        # Limpiar procesos
        if backend_process and backend_process.poll() is None:
            print("\n🛑 Deteniendo backend de prueba...")
            backend_process.terminate()
            try:
                backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                backend_process.kill()
    
    print("\n" + "=" * 80)
    return all_checks_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 