import subprocess
import time
import sys
import os

print("🚀 Iniciando el servidor backend...")
# Iniciar el servidor en un proceso separado
server_process = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

print("⏳ Esperando que el servidor se inicie completamente...")
time.sleep(5)  # Esperar 5 segundos

print("🧪 Ejecutando las pruebas del sistema...")
# Ejecutar las pruebas
test_result = subprocess.run([sys.executable, "test_system.py"])

print("\n🛑 Deteniendo el servidor...")
# Detener el servidor
server_process.terminate()
server_process.wait()

print("✅ Proceso completado")
sys.exit(test_result.returncode) 