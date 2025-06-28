@echo off
echo ========================================
echo    DETENIENDO SISTEMA HOSPITALARIO
echo ========================================
echo.

echo [1/3] Deteniendo procesos de Python (Backend)...
taskkill /F /IM python.exe 2>nul
if errorlevel 1 (
    echo No se encontraron procesos de Python ejecutándose.
) else (
    echo Backend FastAPI detenido.
)

echo.
echo [2/3] Deteniendo procesos de Node.js (Frontend)...
taskkill /F /IM node.exe 2>nul
if errorlevel 1 (
    echo No se encontraron procesos de Node.js ejecutándose.
) else (
    echo Frontend Next.js detenido.
)

echo.
echo [3/3] Limpiando puertos...
netstat -ano | findstr ":8000" >nul 2>&1
if not errorlevel 1 (
    echo Liberando puerto 8000...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":8000"') do taskkill /F /PID %%i 2>nul
)

netstat -ano | findstr ":3000" >nul 2>&1
if not errorlevel 1 (
    echo Liberando puerto 3000...
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":3000"') do taskkill /F /PID %%i 2>nul
)

echo.
echo ========================================
echo    SISTEMA DETENIDO CORRECTAMENTE
echo ========================================
echo.
echo Todos los procesos han sido terminados.
echo Los puertos 3000 y 8000 están ahora disponibles.
echo.
pause 