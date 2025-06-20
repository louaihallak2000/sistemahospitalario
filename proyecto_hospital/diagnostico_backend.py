#!/usr/bin/env python3
"""
Script de diagnóstico para el backend del Sistema Hospitalario
Ejecutar con: python diagnostico_backend.py
"""

import os
import sys
import importlib.util
import socket
import sqlite3
from pathlib import Path

def verificar_estructura_proyecto():
    """Verificar que la estructura del proyecto sea correcta"""
    print("🔍 VERIFICANDO ESTRUCTURA DEL PROYECTO...")
    
    archivos_requeridos = [
        "app/main.py",
        "app/__init__.py",
        "app/core/database.py",
        "app/models/hospital.py",
        "app/api/v1/auth.py",
        "init_db.py"
    ]
    
    errores = []
    for archivo in archivos_requeridos:
        if not os.path.exists(archivo):
            errores.append(f"❌ Falta: {archivo}")
        else:
            print(f"✅ Encontrado: {archivo}")
    
    if errores:
        print("\n❌ ERRORES DE ESTRUCTURA:")
        for error in errores:
            print(f"   {error}")
        return False
    
    print("✅ Estructura del proyecto correcta")
    return True

def verificar_dependencias():
    """Verificar que las dependencias estén instaladas"""
    print("\n🔍 VERIFICANDO DEPENDENCIAS...")
    
    dependencias = [
        "fastapi",
        "uvicorn", 
        "sqlalchemy",
        "passlib",
        "jose",
        "cryptography"
    ]
    
    errores = []
    for dep in dependencias:
        try:
            importlib.import_module(dep if dep != "jose" else "jose.jwt")
            print(f"✅ {dep}: Instalado")
        except ImportError:
            errores.append(dep)
            print(f"❌ {dep}: No instalado")
    
    if errores:
        print(f"\n❌ DEPENDENCIAS FALTANTES: {', '.join(errores)}")
        print("   Ejecutar: pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt]")
        return False
    
    print("✅ Todas las dependencias están instaladas")
    return True

def verificar_puerto():
    """Verificar si el puerto 8000 está disponible"""
    print("\n🔍 VERIFICANDO PUERTO 8000...")
    
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(('127.0.0.1', 8000))
        sock.close()
        print("✅ Puerto 8000 disponible")
        return True
    except OSError:
        print("❌ Puerto 8000 ocupado")
        return False

def verificar_base_datos():
    """Verificar la base de datos SQLite"""
    print("\n🔍 VERIFICANDO BASE DE DATOS...")
    
    if not os.path.exists("hospital_db.sqlite"):
        print("❌ Base de datos no existe")
        print("   Ejecutar: python init_db.py")
        return False
    
    try:
        conn = sqlite3.connect("hospital_db.sqlite")
        cursor = conn.cursor()
        
        # Verificar tablas principales
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tablas = [row[0] for row in cursor.fetchall()]
        
        tablas_requeridas = ["hospitales", "usuarios", "pacientes", "episodios"]
        for tabla in tablas_requeridas:
            if tabla in tablas:
                print(f"✅ Tabla {tabla}: Existe")
            else:
                print(f"❌ Tabla {tabla}: No existe")
        
        conn.close()
        print("✅ Base de datos verificada")
        return True
        
    except Exception as e:
        print(f"❌ Error al verificar base de datos: {e}")
        return False

def verificar_importacion():
    """Verificar que la aplicación FastAPI se pueda importar"""
    print("\n🔍 VERIFICANDO IMPORTACIÓN DE LA APP...")
    
    try:
        sys.path.insert(0, os.getcwd())
        from app.main import app
        print("✅ App FastAPI importada correctamente")
        print(f"   Título: {app.title}")
        print(f"   Versión: {app.version}")
        return True
    except Exception as e:
        print(f"❌ Error al importar app: {e}")
        return False

def generar_comando_inicio():
    """Generar comando de inicio correcto"""
    print("\n🚀 COMANDO DE INICIO RECOMENDADO:")
    print("   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload")
    print("\n🚀 COMANDO ALTERNATIVO:")
    print("   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload")

def main():
    """Función principal de diagnóstico"""
    print("="*60)
    print("    DIAGNÓSTICO DEL BACKEND - SISTEMA HOSPITALARIO")
    print("="*60)
    
    resultados = []
    
    # Ejecutar todas las verificaciones
    resultados.append(verificar_estructura_proyecto())
    resultados.append(verificar_dependencias())
    resultados.append(verificar_puerto())
    resultados.append(verificar_base_datos())
    resultados.append(verificar_importacion())
    
    # Resumen final
    print("\n" + "="*60)
    print("    RESUMEN DEL DIAGNÓSTICO")
    print("="*60)
    
    if all(resultados):
        print("✅ DIAGNÓSTICO EXITOSO: El backend debería funcionar correctamente")
        generar_comando_inicio()
    else:
        print("❌ PROBLEMAS ENCONTRADOS: Revisar los errores anteriores")
        print("\n🔧 PASOS PARA SOLUCIONAR:")
        print("   1. Instalar dependencias faltantes")
        print("   2. Ejecutar: python init_db.py")
        print("   3. Liberar puerto 8000 si está ocupado")
        print("   4. Verificar estructura de archivos")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    main() 