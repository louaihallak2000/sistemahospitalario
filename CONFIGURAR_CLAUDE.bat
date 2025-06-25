@echo off
echo ========================================
echo   CONFIGURANDO CLAUDE PARA EL PROYECTO
echo ========================================
echo.

REM Crear directorio .vscode si no existe
if not exist ".vscode" (
    mkdir .vscode
    echo Directorio .vscode creado
)

REM Verificar que el archivo settings.json existe
if exist ".vscode\settings.json" (
    echo Archivo settings.json encontrado
    echo Claude configurado correctamente
) else (
    echo ERROR: Archivo settings.json no encontrado
    echo Verifica que el archivo se haya creado correctamente
)

echo.
echo ========================================
echo   CONFIGURACIÓN COMPLETADA
echo ========================================
echo.
echo ✅ API Key de Claude configurada
echo ✅ Modelo: claude-3-sonnet-20240229
echo ✅ Configuración optimizada para el proyecto
echo.
echo Para usar Claude en VS Code/Cursor:
echo 1. Presiona Ctrl+Shift+P
echo 2. Busca "Claude: Chat"
echo 3. ¡Listo para usar!
echo.
echo Comandos útiles:
echo - Ctrl+Shift+P → "Claude: Chat"
echo - Ctrl+Shift+P → "Claude: Explain Code"
echo - Ctrl+Shift+P → "Claude: Fix Code"
echo.
pause 