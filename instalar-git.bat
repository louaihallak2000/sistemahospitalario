@echo off
echo ========================================
echo   INSTALADOR DE GIT PARA WINDOWS
echo ========================================
echo.
echo Git parece no estar instalado correctamente en tu sistema.
echo.
echo OPCIONES:
echo.
echo 1. Descarga Git desde el sitio oficial:
echo    https://git-scm.com/download/win
echo.
echo 2. Usa winget (si está disponible):
echo    winget install --id Git.Git -e --source winget
echo.
echo 3. Usa Chocolatey (si está instalado):
echo    choco install git
echo.
echo ========================================
echo.
echo Una vez instalado Git, ejecuta: setup-git.bat
echo.
pause

REM Intentar abrir el navegador en la página de descarga
start https://git-scm.com/download/win 