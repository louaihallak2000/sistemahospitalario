@echo off
echo ========================================
echo   CONFIGURACION GIT PARA GITHUB
echo ========================================
echo.

REM Verificar si Git está instalado
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Git no está instalado o no se encuentra en el PATH.
    echo.
    echo Por favor, instala Git desde: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

echo ✅ Git encontrado. Configurando...
echo.

REM Inicializar repositorio
echo [1/7] Inicializando repositorio Git...
git init

REM Configurar usuario
echo.
echo [2/7] Configurando usuario Git...
git config user.name "louaihallak2000"
git config user.email "louaihallak2000@gmail.com"

REM Verificar estado
echo.
echo [3/7] Estado actual del repositorio...
git status

REM Agregar archivos
echo.
echo [4/7] Agregando todos los archivos...
git add .

REM Hacer commit inicial
echo.
echo [5/7] Realizando commit inicial...
git commit -m "Initial commit: Sistema Hospitalario completo"

REM Cambiar a rama main
echo.
echo [6/7] Cambiando a rama main...
git branch -M main

REM Agregar repositorio remoto
echo.
echo [7/7] Conectando con GitHub...
git remote add origin https://github.com/louaihallak2000/sistemahospitalario.git

echo.
echo ========================================
echo   CONFIGURACION COMPLETADA
echo ========================================
echo.
echo Para subir los cambios a GitHub, ejecuta:
echo   git push -u origin main
echo.
echo Si te pide credenciales, usa tu usuario y token de GitHub.
echo.
pause 