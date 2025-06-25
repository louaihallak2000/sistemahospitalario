@echo off
title 🚨 SOLUCION EMERGENCIA - BACKEND HOSPITALARIO
color 0C

echo ================================================
echo   🚨 EJECUTANDO SOLUCION DE EMERGENCIA
echo   SISTEMA HOSPITALARIO - NETWORKERROR
echo ================================================
echo.

echo [1/6] Matando todos los procesos Python y Node...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
taskkill /F /IM pythonw.exe 2>nul
timeout /t 3 >nul

echo [2/6] Verificando puerto 8000...
netstat -ano | findstr :8000
if %errorlevel% == 0 (
    echo ⚠️  Puerto 8000 ocupado, liberando...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a 2>nul
    timeout /t 2 >nul
) else (
    echo ✅ Puerto 8000 libre
)

echo [3/6] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Python no esta instalado
    echo Instala Python desde https://python.org
    pause
    exit /b 1
)
echo ✅ Python encontrado

echo [4/6] Verificando backend de emergencia...
if not exist "BACKEND_EMERGENCIA.py" (
    echo ❌ ERROR: BACKEND_EMERGENCIA.py NO EXISTE
    echo El archivo debe estar en el directorio actual
    pause
    exit /b 1
)
echo ✅ BACKEND_EMERGENCIA.py encontrado

echo [5/6] Probando sintaxis del backend...
python -c "import BACKEND_EMERGENCIA; print('✅ Sintaxis correcta')" 2>nul
if errorlevel 1 (
    echo ❌ ERROR: Sintaxis incorrecta en BACKEND_EMERGENCIA.py
    pause
    exit /b 1
)
echo ✅ Sintaxis del backend correcta

echo [6/6] 🚨 INICIANDO BACKEND DE EMERGENCIA...
echo.
echo ================================================
echo   🎯 BACKEND DE EMERGENCIA INICIANDO
echo ================================================
echo 📍 URL: http://127.0.0.1:8000
echo 🔧 Health Check: http://127.0.0.1:8000/health
echo 🎯 Endpoint Crítico: http://127.0.0.1:8000/episodios/estadisticos
echo 📋 Lista Espera: http://127.0.0.1:8000/episodios/lista-espero
echo 🔐 Login: POST http://127.0.0.1:8000/api/auth/login
echo 🧪 Test CORS: http://127.0.0.1:8000/test/cors
echo.
echo ✅ CORS configurado para permitir TODO
echo ✅ Endpoints críticos implementados
echo ✅ Logging detallado activado
echo ✅ Sin dependencias externas
echo.
echo Presiona Ctrl+C para detener el servidor
echo ================================================
echo.

python BACKEND_EMERGENCIA.py

echo.
echo ================================================
echo   🛑 BACKEND DE EMERGENCIA DETENIDO
echo ================================================
pause 