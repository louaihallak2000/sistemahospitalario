@echo off
chcp 65001 >nul 2>&1
title Sistema Hospitalario - Detener Sistema

color 0C
echo.
echo ████████████████████████████████████████████████████████████████████████
echo ██                                                                    ██
echo ██                    🛑 SISTEMA HOSPITALARIO                        ██
echo ██                     Detener Sistema                               ██
echo ██                                                                    ██
echo ████████████████████████████████████████████████████████████████████████
echo.

echo 🛑 DETENIENDO SISTEMA HOSPITALARIO...
echo ─────────────────────────────────────

:: Detener procesos de Python (Backend)
echo 🔧 Deteniendo Backend (Python/FastAPI)...
tasklist /FI "IMAGENAME eq python.exe" 2>nul | find /I "python.exe" >nul
if %errorlevel% equ 0 (
    taskkill /F /IM python.exe /T >nul 2>&1
    echo ✅ Backend detenido
) else (
    echo ℹ️  Backend no estaba ejecutándose
)

:: Detener procesos de Node.js (Frontend)
echo 🎨 Deteniendo Frontend (Node.js/Next.js)...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "node.exe" >nul
if %errorlevel% equ 0 (
    taskkill /F /IM node.exe /T >nul 2>&1
    echo ✅ Frontend detenido
) else (
    echo ℹ️  Frontend no estaba ejecutándose
)

:: Detener cualquier proceso de Next.js
tasklist /FI "IMAGENAME eq next.exe" 2>nul | find /I "next.exe" >nul
if %errorlevel% equ 0 (
    taskkill /F /IM next.exe /T >nul 2>&1
    echo ✅ Next.js detenido
) else (
    echo ℹ️  Next.js no estaba ejecutándose
)

:: Cerrar ventanas específicas del sistema hospitalario
echo 🪟 Cerrando ventanas del sistema...
taskkill /FI "WINDOWTITLE eq 🏥 Sistema Hospitalario - BACKEND" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq 🏥 Sistema Hospitalario - FRONTEND" /F >nul 2>&1

echo.
echo ████████████████████████████████████████████████████████████████████████
echo ██                                                                    ██
echo ██                    ✅ SISTEMA DETENIDO COMPLETAMENTE               ██
echo ██                                                                    ██
echo ████████████████████████████████████████████████████████████████████████
echo.

echo 📋 RESUMEN:
echo ─────────────────────────────────────
echo • Backend FastAPI: Detenido
echo • Frontend Next.js: Detenido  
echo • Ventanas del sistema: Cerradas
echo • Puertos 8000 y 3000: Liberados
echo.

echo 💡 PRÓXIMOS PASOS:
echo ─────────────────────────────────────
echo • Para reiniciar: Ejecuta "INICIAR_SISTEMA_HOSPITALARIO.bat"
echo • Los datos se mantienen guardados en la base de datos
echo • Las configuraciones se conservan
echo.

echo Presiona cualquier tecla para salir...
pause >nul

exit /b 0 