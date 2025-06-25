#!/usr/bin/env python3
"""
Corrección completa del sistema de login
Soluciona: formato de datos, contraseñas y hospital_code
"""

import sqlite3
import requests
import json
from app.core.security import get_password_hash

def corregir_contraseñas():
    """Corregir las contraseñas con hashes de ejemplo inválidos"""
    
    print("🔧 CORRIGIENDO CONTRASEÑAS EN LA BASE DE DATOS")
    print("-" * 50)
    
    try:
        conn = sqlite3.connect("hospital_db.sqlite")
        cursor = conn.cursor()
        
        # Obtener usuarios con contraseñas de ejemplo
        cursor.execute("SELECT id, username, password_hash FROM usuarios WHERE password_hash LIKE '%ejemplo_hash%'")
        usuarios_problema = cursor.fetchall()
        
        if not usuarios_problema:
            print("✅ No hay contraseñas de ejemplo para corregir")
            conn.close()
            return True
        
        print(f"🔍 Encontrados {len(usuarios_problema)} usuarios con hashes de ejemplo")
        
        # Contraseñas por defecto por usuario
        contraseñas_por_defecto = {
            "dr.martinez": "medico123",
            "enf.garcia": "enfermera123", 
            "enf.lopez": "enfermera123",
            "admin": "admin123"
        }
        
        for user_id, username, old_hash in usuarios_problema:
            # Obtener contraseña por defecto
            if username in contraseñas_por_defecto:
                nueva_contraseña = contraseñas_por_defecto[username]
            else:
                nueva_contraseña = "123456"  # Contraseña por defecto
            
            # Generar hash válido
            nuevo_hash = get_password_hash(nueva_contraseña)
            
            # Actualizar en la base de datos
            cursor.execute(
                "UPDATE usuarios SET password_hash = ? WHERE id = ?", 
                (nuevo_hash, user_id)
            )
            
            print(f"✅ {username}: Nueva contraseña '{nueva_contraseña}'")
        
        conn.commit()
        conn.close()
        
        print(f"\n🎉 {len(usuarios_problema)} contraseñas corregidas exitosamente")
        return True
        
    except Exception as e:
        print(f"❌ Error corrigiendo contraseñas: {e}")
        return False

def obtener_hospital_code():
    """Obtener el código del hospital desde la base de datos"""
    
    try:
        conn = sqlite3.connect("hospital_db.sqlite")
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM hospitales LIMIT 1")
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return result[0]
        else:
            return "HG001"  # Por defecto
            
    except Exception as e:
        print(f"⚠️  Error obteniendo hospital_code: {e}")
        return "HG001"

def test_login_corregido():
    """Probar login con el formato correcto"""
    
    print("\n🔐 PROBANDO LOGIN CON FORMATO CORRECTO")
    print("-" * 50)
    
    # Obtener hospital_code
    hospital_code = obtener_hospital_code()
    print(f"🏥 Hospital code: {hospital_code}")
    
    # URL del endpoint
    url = "http://localhost:8000/auth/login"
    
    # Usuarios de prueba con contraseñas corregidas
    usuarios_prueba = [
        {
            "hospital_code": hospital_code,
            "username": "dr.martinez", 
            "password": "medico123"
        },
        {
            "hospital_code": hospital_code,
            "username": "enf.garcia",
            "password": "enfermera123"
        },
        {
            "hospital_code": hospital_code,
            "username": "admin",
            "password": "admin123"
        }
    ]
    
    print("\n🔑 Probando credenciales corregidas...")
    
    login_exitoso = False
    
    for usuario in usuarios_prueba:
        try:
            response = requests.post(
                url,
                json=usuario,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            username = usuario["username"]
            print(f"\n👤 Usuario: {username}")
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "access_token" in data:
                        print(f"✅ ¡LOGIN EXITOSO!")
                        print(f"🎫 Token: {data['access_token'][:50]}...")
                        print(f"🔐 Tipo: {data.get('token_type', 'bearer')}")
                        login_exitoso = True
                    else:
                        print(f"⚠️  Respuesta sin token: {data}")
                except Exception as e:
                    print(f"❌ Error parseando respuesta: {e}")
                    print(f"📄 Respuesta raw: {response.text[:200]}")
                    
            elif response.status_code == 401:
                print(f"🔑 Credenciales incorrectas")
                
            elif response.status_code == 422:
                print(f"📋 Error de formato:")
                try:
                    error_data = response.json()
                    print(f"   {error_data}")
                except:
                    print(f"   {response.text[:200]}")
                    
            else:
                print(f"❓ Error inesperado: {response.status_code}")
                print(f"📄 Respuesta: {response.text[:200]}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ Error: Backend no está corriendo")
            return False
            
        except Exception as e:
            print(f"❌ Error probando {username}: {e}")
    
    return login_exitoso

def verificar_usuarios_validos():
    """Mostrar todos los usuarios válidos disponibles"""
    
    print("\n👥 USUARIOS DISPONIBLES PARA LOGIN")
    print("-" * 50)
    
    try:
        conn = sqlite3.connect("hospital_db.sqlite")
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT username, rol, password_hash 
            FROM usuarios 
            WHERE password_hash NOT LIKE '%ejemplo_hash%'
            ORDER BY rol, username
        """)
        
        usuarios = cursor.fetchall()
        conn.close()
        
        if not usuarios:
            print("❌ No hay usuarios con contraseñas válidas")
            return
        
        print("✅ Usuarios con contraseñas válidas:")
        
        roles_passwords = {
            "medico": "medico123",
            "enfermera": "enfermera123", 
            "administrador": "admin123"
        }
        
        for username, rol, password_hash in usuarios:
            # Sugerir contraseña probable
            contraseña_sugerida = roles_passwords.get(rol, "123456")
            
            print(f"   • {username} ({rol})")
            print(f"     Contraseña sugerida: {contraseña_sugerida}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Función principal de corrección"""
    
    print("🏥 CORRECCIÓN COMPLETA DEL SISTEMA DE LOGIN")
    print("=" * 60)
    
    # 1. Verificar que el backend esté corriendo
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code != 200:
            print("❌ ERROR: Backend no responde correctamente")
            return
        print("✅ Backend está corriendo")
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Backend no está corriendo")
        print("💡 SOLUCIÓN: Ejecuta 'python iniciar_backend_corregido.py'")
        return
    
    # 2. Corregir contraseñas
    print("\n" + "="*60)
    if not corregir_contraseñas():
        print("❌ Error corrigiendo contraseñas")
        return
    
    # 3. Probar login corregido
    print("\n" + "="*60)
    login_exitoso = test_login_corregido()
    
    # 4. Mostrar usuarios disponibles
    print("\n" + "="*60)
    verificar_usuarios_validos()
    
    # 5. Resumen final
    print("\n" + "="*60)
    if login_exitoso:
        print("🎉 ¡LOGIN FUNCIONANDO CORRECTAMENTE!")
        print("\n📋 FORMATO CORRECTO PARA LOGIN:")
        print("""
        POST http://localhost:8000/auth/login
        Content-Type: application/json
        
        {
            "hospital_code": "HG001",
            "username": "dr.martinez",
            "password": "medico123"
        }
        """)
    else:
        print("🔧 LOGIN AÚN REQUIERE AJUSTES")
        print("\n🛠️  PRÓXIMOS PASOS:")
        print("1. Verificar el servicio de autenticación")
        print("2. Revisar logs del backend para errores")
        print("3. Consultar http://localhost:8000/docs")

if __name__ == "__main__":
    main() 