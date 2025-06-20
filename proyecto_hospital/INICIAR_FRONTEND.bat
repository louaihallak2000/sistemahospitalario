@echo off
title Sistema Hospitalario - Frontend

echo.
echo =============================================
echo      SISTEMA HOSPITALARIO - FRONTEND
echo =============================================
echo.

:: Verificar directorio frontend
if not exist "frontend\package.json" (
    echo ❌ ERROR: No se encuentra frontend\package.json
    echo    Ejecutar desde el directorio proyecto_hospital
    pause
    exit /b 1
)

echo ✅ Frontend encontrado
echo.

:: Limpiar puerto 3000
echo 🧹 Limpiando puerto 3000...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3000"') do (
    taskkill /F /PID %%p >nul 2>&1
)

echo.
echo 🌐 INICIANDO FRONTEND...
echo    URL: http://localhost:3000
echo.
echo ⚠️  MANTENER ESTA VENTANA ABIERTA
echo.

:: Cambiar al directorio frontend e iniciar
cd frontend
npm run dev 