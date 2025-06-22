"""
Script de prueba del sistema hospitalario
Ejecutar con: python test_system.py
"""

import httpx
import json
import logging
import sys
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# URL base del API
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Probar el endpoint de health check"""
    try:
        response = httpx.get(f"{BASE_URL}/health")
        logger.info(f"Health Check: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            logger.info(f"✅ Sistema saludable - DB: {data.get('database')}")
            return True
        else:
            logger.error(f"❌ Health check falló: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ Error conectando al servidor: {e}")
        return False

def test_login():
    """Probar autenticación"""
    try:
        login_data = {
            "hospital_code": "HOSP001",
            "username": "admin",
            "password": "admin123"
        }
        
        response = httpx.post(f"{BASE_URL}/auth/login", json=login_data)
        logger.info(f"Login: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            logger.info("✅ Login exitoso")
            return data.get("access_token")
        else:
            logger.error(f"❌ Login falló: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"❌ Error en login: {e}")
        return None

def test_endpoints(token):
    """Probar endpoints principales"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test GET /pacientes
    try:
        response = httpx.get(f"{BASE_URL}/pacientes", headers=headers)
        logger.info(f"GET /pacientes: {response.status_code}")
        if response.status_code == 200:
            pacientes = response.json()
            logger.info(f"✅ Encontrados {len(pacientes)} pacientes")
        else:
            logger.error(f"❌ Error obteniendo pacientes: {response.text}")
    except Exception as e:
        logger.error(f"❌ Error en GET /pacientes: {e}")
    
    # Test GET /episodios
    try:
        response = httpx.get(f"{BASE_URL}/episodios", headers=headers)
        logger.info(f"GET /episodios: {response.status_code}")
        if response.status_code == 200:
            episodios = response.json()
            logger.info(f"✅ Encontrados {len(episodios)} episodios")
        else:
            logger.error(f"❌ Error obteniendo episodios: {response.text}")
    except Exception as e:
        logger.error(f"❌ Error en GET /episodios: {e}")
    
    # Test GET /episodios/lista-espera
    try:
        response = httpx.get(f"{BASE_URL}/episodios/lista-espera", headers=headers)
        logger.info(f"GET /episodios/lista-espera: {response.status_code}")
        if response.status_code == 200:
            lista = response.json()
            logger.info(f"✅ {len(lista)} pacientes en lista de espera")
        else:
            logger.error(f"❌ Error obteniendo lista de espera: {response.text}")
    except Exception as e:
        logger.error(f"❌ Error en GET /episodios/lista-espera: {e}")
    
    # Test POST /pacientes
    try:
        nuevo_paciente = {
            "dni": f"TEST{int(datetime.now().timestamp())}",
            "nombre_completo": "Paciente de Prueba",
            "fecha_nacimiento": "1990-01-01",
            "sexo": "M",
            "tipo_sangre": "O+",
            "alergias_conocidas": "Ninguna"
        }
        
        response = httpx.post(f"{BASE_URL}/pacientes", json=nuevo_paciente, headers=headers)
        logger.info(f"POST /pacientes: {response.status_code}")
        if response.status_code == 200:
            logger.info("✅ Paciente creado exitosamente")
        else:
            logger.error(f"❌ Error creando paciente: {response.text}")
    except Exception as e:
        logger.error(f"❌ Error en POST /pacientes: {e}")

def main():
    """Función principal de prueba"""
    logger.info("🚀 Iniciando pruebas del sistema hospitalario...")
    logger.info("=" * 50)
    
    # 1. Health check
    if not test_health_check():
        logger.error("El servidor no está respondiendo. Asegúrate de que esté ejecutándose.")
        return
    
    # 2. Login
    token = test_login()
    if not token:
        logger.error("No se pudo autenticar. Verifica las credenciales.")
        return
    
    # 3. Probar endpoints
    test_endpoints(token)
    
    logger.info("=" * 50)
    logger.info("✅ Pruebas completadas")

if __name__ == "__main__":
    main() 