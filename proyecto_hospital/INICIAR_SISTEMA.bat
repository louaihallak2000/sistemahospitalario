@echo off
title Sistema Hospitalario - Inicio Manual

echo.
echo =============================================
echo        SISTEMA HOSPITALARIO - INICIO
echo =============================================
echo.

echo 🔧 Ejecutando desde: %CD%
echo.

:: Verificar archivo principal
if not exist "app\main.py" (
    echo ❌ ERROR: No se encuentra app\main.py
    echo    Ejecutar desde el directorio proyecto_hospital
    pause
    exit /b 1
)

echo ✅ Estructura verificada
echo.

:: Limpiar puertos
echo 🧹 Limpiando puertos...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":8000"') do (
    taskkill /F /PID %%p >nul 2>&1
)

echo.
echo 🚀 INICIANDO BACKEND...
echo    URL: http://127.0.0.1:8000
echo    Docs: http://127.0.0.1:8000/docs
echo.
echo ⚠️  MANTENER ESTA VENTANA ABIERTA
echo.

:: Iniciar backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload 