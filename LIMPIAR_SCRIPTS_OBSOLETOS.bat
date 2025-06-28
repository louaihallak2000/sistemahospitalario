@echo off
title Limpiar Scripts Obsoletos - Sistema Hospitalario

echo ========================================
echo 🧹 LIMPIAR SCRIPTS OBSOLETOS
echo 🏥 Sistema Hospitalario
echo ========================================
echo.

echo ⚠️  ADVERTENCIA: Este script moverá archivos obsoletos a una carpeta "_obsoletos"
echo ⚠️  Los scripts esenciales se mantendrán en el directorio principal
echo.
echo 📋 Scripts que se MANTIENEN (esenciales):
echo   ✅ INICIAR_NUEVO_WORKFLOW.bat
echo   ✅ SISTEMA_COMPLETO_FUNCIONANDO.bat
echo   ✅ INICIAR_FRONTEND_NUEVO_WORKFLOW.bat
echo   ✅ DETENER_SISTEMA_HOSPITALARIO_COMPLETO.bat
echo   ✅ DETENER_SISTEMA.ps1
echo   ✅ INSTALAR_DEPENDENCIAS.bat
echo   ✅ README.md
echo   ✅ GUIA_RAPIDA_SISTEMA_HOSPITALARIO.md
echo.
echo 📋 Scripts que se MUEVEN a _obsoletos:
echo   ❌ INICIAR_SISTEMA_HOSPITALARIO_COMPLETO.bat
echo   ❌ INICIAR_SISTEMA_HOSPITALARIO.bat
echo   ❌ INICIAR_SISTEMA_CORREGIDO.bat
echo   ❌ INICIAR_SISTEMA_COMPLETO.bat
echo   ❌ INICIAR_SISTEMA_COMPLETO.ps1
echo   ❌ DETENER_SISTEMA_HOSPITALARIO.bat
echo   ❌ DETENER_SISTEMA.bat
echo   ❌ start_system.bat
echo   ❌ stop_system.bat
echo   ❌ start_debug.bat
echo   ❌ Y otros archivos de pruebas/debug
echo.

set /p confirmacion="¿Deseas continuar? (s/n): "
if /i "%confirmacion%" neq "s" (
    echo ❌ Operación cancelada
    pause
    exit /b 0
)

echo.
echo 📁 Creando carpeta _obsoletos...
if not exist "_obsoletos" mkdir "_obsoletos"
if not exist "_obsoletos\scripts_iniciales" mkdir "_obsoletos\scripts_iniciales"
if not exist "_obsoletos\scripts_debug" mkdir "_obsoletos\scripts_debug"
if not exist "_obsoletos\scripts_pruebas" mkdir "_obsoletos\scripts_pruebas"
if not exist "_obsoletos\documentacion_antigua" mkdir "_obsoletos\documentacion_antigua"

echo ✅ Carpetas creadas

echo.
echo 🔄 Moviendo scripts obsoletos de iniciación...

if exist "INICIAR_SISTEMA_HOSPITALARIO_COMPLETO.bat" (
    move "INICIAR_SISTEMA_HOSPITALARIO_COMPLETO.bat" "_obsoletos\scripts_iniciales\"
    echo   📦 Movido: INICIAR_SISTEMA_HOSPITALARIO_COMPLETO.bat
)

if exist "INICIAR_SISTEMA_HOSPITALARIO.bat" (
    move "INICIAR_SISTEMA_HOSPITALARIO.bat" "_obsoletos\scripts_iniciales\"
    echo   📦 Movido: INICIAR_SISTEMA_HOSPITALARIO.bat
)

if exist "INICIAR_SISTEMA_CORREGIDO.bat" (
    move "INICIAR_SISTEMA_CORREGIDO.bat" "_obsoletos\scripts_iniciales\"
    echo   📦 Movido: INICIAR_SISTEMA_CORREGIDO.bat
)

if exist "INICIAR_SISTEMA_COMPLETO.bat" (
    move "INICIAR_SISTEMA_COMPLETO.bat" "_obsoletos\scripts_iniciales\"
    echo   📦 Movido: INICIAR_SISTEMA_COMPLETO.bat
)

if exist "INICIAR_SISTEMA_COMPLETO.ps1" (
    move "INICIAR_SISTEMA_COMPLETO.ps1" "_obsoletos\scripts_iniciales\"
    echo   📦 Movido: INICIAR_SISTEMA_COMPLETO.ps1
)

if exist "start_system.bat" (
    move "start_system.bat" "_obsoletos\scripts_iniciales\"
    echo   📦 Movido: start_system.bat
)

echo.
echo 🛑 Moviendo scripts obsoletos de detención...

if exist "DETENER_SISTEMA_HOSPITALARIO.bat" (
    move "DETENER_SISTEMA_HOSPITALARIO.bat" "_obsoletos\scripts_iniciales\"
    echo   📦 Movido: DETENER_SISTEMA_HOSPITALARIO.bat
)

if exist "DETENER_SISTEMA.bat" (
    move "DETENER_SISTEMA.bat" "_obsoletos\scripts_iniciales\"
    echo   📦 Movido: DETENER_SISTEMA.bat
)

if exist "stop_system.bat" (
    move "stop_system.bat" "_obsoletos\scripts_iniciales\"
    echo   📦 Movido: stop_system.bat
)

echo.
echo 🔍 Moviendo scripts de debug y pruebas...

if exist "start_debug.bat" (
    move "start_debug.bat" "_obsoletos\scripts_debug\"
    echo   📦 Movido: start_debug.bat
)

if exist "test_direct.bat" (
    move "test_direct.bat" "_obsoletos\scripts_debug\"
    echo   📦 Movido: test_direct.bat
)

if exist "diagnostico_rapido.bat" (
    move "diagnostico_rapido.bat" "_obsoletos\scripts_debug\"
    echo   📦 Movido: diagnostico_rapido.bat
)

if exist "fix_cors.bat" (
    move "fix_cors.bat" "_obsoletos\scripts_debug\"
    echo   📦 Movido: fix_cors.bat
)

if exist "VERIFICACION_FINAL.bat" (
    move "VERIFICACION_FINAL.bat" "_obsoletos\scripts_debug\"
    echo   📦 Movido: VERIFICACION_FINAL.bat
)

echo.
echo 🧪 Moviendo scripts de pruebas específicas...

if exist "TEST_*.bat" (
    move "TEST_*.bat" "_obsoletos\scripts_pruebas\" 2>nul
    echo   📦 Movido: Scripts TEST_*.bat
)

if exist "PROBAR_*.bat" (
    move "PROBAR_*.bat" "_obsoletos\scripts_pruebas\" 2>nul
    echo   📦 Movido: Scripts PROBAR_*.bat
)

if exist "SOLUCION_*.bat" (
    move "SOLUCION_*.bat" "_obsoletos\scripts_pruebas\" 2>nul
    echo   📦 Movido: Scripts SOLUCION_*.bat
)

echo.
echo 📄 Moviendo documentación antigua...

if exist "LEEME_SISTEMA_HOSPITALARIO.txt" (
    move "LEEME_SISTEMA_HOSPITALARIO.txt" "_obsoletos\documentacion_antigua\"
    echo   📦 Movido: LEEME_SISTEMA_HOSPITALARIO.txt
)

if exist "INSTRUCCIONES_SISTEMA_CORREGIDO.md" (
    move "INSTRUCCIONES_SISTEMA_CORREGIDO.md" "_obsoletos\documentacion_antigua\"
    echo   📦 Movido: INSTRUCCIONES_SISTEMA_CORREGIDO.md
)

if exist "SOLUCION_*.md" (
    move "SOLUCION_*.md" "_obsoletos\documentacion_antigua\" 2>nul
    echo   📦 Movido: Documentación SOLUCION_*.md
)

if exist "RESOLUCION_*.md" (
    move "RESOLUCION_*.md" "_obsoletos\documentacion_antigua\" 2>nul
    echo   📦 Movido: Documentación RESOLUCION_*.md
)

echo.
echo 🧹 Moviendo otros archivos obsoletos...

if exist "CREDENCIALES_LOGIN.txt" (
    move "CREDENCIALES_LOGIN.txt" "_obsoletos\documentacion_antigua\"
    echo   📦 Movido: CREDENCIALES_LOGIN.txt
)

if exist "backend_emergencia.log" (
    move "backend_emergencia.log" "_obsoletos\scripts_debug\"
    echo   📦 Movido: backend_emergencia.log
)

if exist "debug_network_error.html" (
    move "debug_network_error.html" "_obsoletos\scripts_debug\"
    echo   📦 Movido: debug_network_error.html
)

echo.
echo 📝 Creando archivo de referencia...
echo # 📁 SCRIPTS OBSOLETOS MOVIDOS > "_obsoletos\README.md"
echo. >> "_obsoletos\README.md"
echo Esta carpeta contiene scripts y archivos obsoletos del sistema hospitalario. >> "_obsoletos\README.md"
echo. >> "_obsoletos\README.md"
echo ## 📋 Organización: >> "_obsoletos\README.md"
echo - **scripts_iniciales/**: Scripts de iniciación/detención antiguos >> "_obsoletos\README.md"
echo - **scripts_debug/**: Scripts de debug y diagnóstico >> "_obsoletos\README.md"
echo - **scripts_pruebas/**: Scripts de pruebas específicas >> "_obsoletos\README.md"
echo - **documentacion_antigua/**: Documentación obsoleta >> "_obsoletos\README.md"
echo. >> "_obsoletos\README.md"
echo ## ✅ Scripts Actuales Recomendados: >> "_obsoletos\README.md"
echo - INICIAR_NUEVO_WORKFLOW.bat >> "_obsoletos\README.md"
echo - SISTEMA_COMPLETO_FUNCIONANDO.bat >> "_obsoletos\README.md"
echo - DETENER_SISTEMA_HOSPITALARIO_COMPLETO.bat >> "_obsoletos\README.md"
echo. >> "_obsoletos\README.md"
echo Fecha de limpieza: %date% %time% >> "_obsoletos\README.md"

echo ✅ Archivo de referencia creado

echo.
echo ========================================
echo 🎉 LIMPIEZA COMPLETADA
echo ========================================
echo.
echo 📊 Resumen:
echo   🗂️  Archivos movidos a: _obsoletos\
echo   ✅ Scripts esenciales mantenidos
echo   📝 Archivo de referencia creado
echo.
echo 🚀 Scripts principales para usar:
echo.
echo 📋 INICIAR SISTEMA:
echo   ⭐ INICIAR_NUEVO_WORKFLOW.bat              (Rápido - RECOMENDADO)
echo   🔧 SISTEMA_COMPLETO_FUNCIONANDO.bat        (Completo con verificaciones)
echo   🌐 INICIAR_FRONTEND_NUEVO_WORKFLOW.bat     (Solo frontend)
echo.
echo 🛑 DETENER SISTEMA:
echo   ⭐ DETENER_SISTEMA_HOSPITALARIO_COMPLETO.bat  (RECOMENDADO)
echo   🔧 DETENER_SISTEMA.ps1                        (PowerShell avanzado)
echo.
echo 📦 OTROS:
echo   🔧 INSTALAR_DEPENDENCIAS.bat               (Instalación inicial)
echo   📖 README.md                               (Documentación principal)
echo   📋 GUIA_RAPIDA_SISTEMA_HOSPITALARIO.md     (Guía de uso)
echo.
echo 💡 Directorio mucho más limpio y organizado!
echo.
echo ⚠️  Presiona cualquier tecla para cerrar
echo ========================================
pause 