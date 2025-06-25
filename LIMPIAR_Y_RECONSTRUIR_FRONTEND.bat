@echo off
echo ========================================
echo   LIMPIANDO Y RECONSTRUYENDO FRONTEND
echo ========================================
echo.

REM Detener procesos Node.js existentes
echo [1/8] Deteniendo procesos Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

REM Navegar al directorio del frontend
echo [2/8] Navegando al directorio del frontend...
cd proyecto_hospital\frontend
if not exist "package.json" (
    echo ERROR: No se encuentra el directorio del frontend
    pause
    exit /b 1
)

REM Limpiar caché de Next.js
echo [3/8] Limpiando caché de Next.js...
if exist ".next" (
    rmdir /s /q ".next"
    echo Caché .next eliminado
)
if exist "out" (
    rmdir /s /q "out"
    echo Directorio out eliminado
)

REM Limpiar caché de Node.js
echo [4/8] Limpiando caché de Node.js...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Caché de node_modules eliminado
)

REM Limpiar archivos temporales
echo [5/8] Limpiando archivos temporales...
if exist "*.tsbuildinfo" (
    del /q "*.tsbuildinfo"
)

REM Reinstalar dependencias
echo [6/8] Reinstalando dependencias...
echo Eliminando node_modules...
if exist "node_modules" (
    rmdir /s /q "node_modules"
)
echo Eliminando package-lock.json...
if exist "package-lock.json" (
    del /q "package-lock.json"
)

echo Instalando dependencias con legacy-peer-deps...
npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: Fallo en la instalación de dependencias
    pause
    exit /b 1
)

REM Construir el proyecto
echo [7/8] Construyendo el proyecto...
npm run build
if errorlevel 1 (
    echo ADVERTENCIA: El build falló, pero continuaremos
)

REM Iniciar en modo desarrollo
echo [8/8] Iniciando en modo desarrollo...
echo.
echo ========================================
echo   FRONTEND LIMPIO Y RECONSTRUIDO
echo ========================================
echo.
echo El frontend se iniciará ahora...
echo Presiona Ctrl+C para detener
echo.

npm run dev

echo.
echo Frontend detenido.
pause 