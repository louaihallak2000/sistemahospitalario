@echo off
echo ========================================
echo   ACTUALIZAR REPOSITORIO GITHUB
echo ========================================
echo.

REM Verificar si Git está instalado
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Git no está instalado o no se encuentra en el PATH.
    pause
    exit /b 1
)

REM Verificar si estamos en un repositorio Git
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: No estás en un repositorio Git.
    echo Ejecuta primero: setup-git.bat
    pause
    exit /b 1
)

REM Mostrar estado actual
echo 📊 Estado actual del repositorio:
echo.
git status --short

REM Pedir mensaje de commit
echo.
set /p commit_msg="📝 Mensaje de commit (Enter para usar mensaje por defecto): "

REM Si no se proporciona mensaje, usar uno por defecto
if "%commit_msg%"=="" (
    set commit_msg=Actualización: %date% %time%
)

REM Agregar todos los cambios
echo.
echo [1/3] Agregando cambios...
git add .

REM Hacer commit
echo.
echo [2/3] Haciendo commit...
git commit -m "%commit_msg%"

REM Verificar si el commit fue exitoso
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  No hay cambios para commitear o hubo un error.
    pause
    exit /b 0
)

REM Push a GitHub
echo.
echo [3/3] Subiendo cambios a GitHub...
git push origin main

REM Verificar resultado
if %errorlevel% equ 0 (
    echo.
    echo ✅ ¡Cambios subidos exitosamente a GitHub!
    echo.
    echo 🔗 Ver repositorio: https://github.com/louaihallak2000/sistemahospitalario
) else (
    echo.
    echo ❌ Error al subir cambios. Posibles causas:
    echo    - No hay conexión a internet
    echo    - Necesitas autenticarte con GitHub
    echo    - El repositorio remoto no está configurado
    echo.
    echo Intenta ejecutar manualmente:
    echo    git push -u origin main
)

echo.
pause 