@echo off
echo ============================================
echo    DETENIENDO SISTEMA HOSPITALARIO
echo ============================================
echo.

echo Cerrando procesos de Python (Backend)...
taskkill /F /IM python.exe 2>nul

echo Cerrando procesos de Node.js (Frontend)...
taskkill /F /IM node.exe 2>nul

echo.
echo ============================================
echo    SISTEMA DETENIDO
echo ============================================
echo.
pause 