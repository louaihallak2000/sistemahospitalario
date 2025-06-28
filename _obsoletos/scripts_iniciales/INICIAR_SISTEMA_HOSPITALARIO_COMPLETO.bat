@echo off
title Sistema Hospitalario - Inicio Completo
echo.
echo ========================================
echo    🏥 SISTEMA HOSPITALARIO COMPLETO
echo ========================================
echo.

echo 📋 1. Inicializando Base de Datos...
cd proyecto_hospital
python init_db.py
if %errorlevel% neq 0 (
    echo ❌ Error inicializando base de datos
    pause
    exit /b 1
)

echo.
echo 🚨 2. Inicializando Shockroom...
python init_shockroom.py
if %errorlevel% neq 0 (
    echo ❌ Error inicializando shockroom
    pause
    exit /b 1
)

echo.
echo 🔧 3. Iniciando Backend...
start "Backend Hospital" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo 🎨 4. Iniciando Frontend...
cd frontend
start "Frontend Hospital" cmd /k "npm run dev"

echo.
echo ✅ Sistema iniciándose...
echo.
echo 📍 URLs del Sistema:
echo    Frontend: http://localhost:3000
echo    Backend:  http://127.0.0.1:8000
echo    API Docs: http://127.0.0.1:8000/docs
echo.
echo 👤 Credenciales de prueba:
echo    Usuario: admin
echo    Contraseña: admin123
echo    Hospital: Hospital Central San Juan
echo.
echo ⏳ Esperando 20 segundos para que los servicios se inicien...
timeout /t 20 /nobreak > nul

echo.
echo 🌐 Abriendo navegador...
start http://localhost:3000

echo.
echo 🎉 Sistema hospitalario iniciado completamente!
echo.
echo 💡 Para detener el sistema ejecute: DETENER_SISTEMA_HOSPITALARIO_COMPLETO.bat
echo.
echo    Presione cualquier tecla para salir...
pause > nul 