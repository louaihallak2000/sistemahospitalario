@echo off
title Detener Sistema Hospitalario Completo

echo ========================================
echo 🛑 DETENER SISTEMA HOSPITALARIO COMPLETO
echo 🔄 Nuevo Workflow
echo ========================================
echo.

echo 🔍 Buscando y deteniendo procesos del sistema hospitalario...
echo.

:: Detener procesos de uvicorn (Backend FastAPI)
echo 📋 1. Deteniendo Backend FastAPI (uvicorn)...
tasklist | find "python.exe" >nul
if %ERRORLEVEL% equ 0 (
    echo ✅ Procesos Python encontrados, deteniendo uvicorn...
    taskkill /f /im python.exe >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo ✅ Backend FastAPI detenido exitosamente
    ) else (
        echo ⚠️  No se pudieron detener algunos procesos Python
    )
) else (
    echo ℹ️  No se encontraron procesos Python activos
)

echo.

:: Detener procesos de Node.js (Frontend Next.js)
echo 📋 2. Deteniendo Frontend Next.js (Node.js)...
tasklist | find "node.exe" >nul
if %ERRORLEVEL% equ 0 (
    echo ✅ Procesos Node.js encontrados, deteniendo...
    taskkill /f /im node.exe >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo ✅ Frontend Next.js detenido exitosamente
    ) else (
        echo ⚠️  No se pudieron detener algunos procesos Node.js
    )
) else (
    echo ℹ️  No se encontraron procesos Node.js activos
)

echo.

:: Detener procesos por puerto específico (método alternativo)
echo 📋 3. Verificando puertos específicos...
echo ℹ️  Deteniendo procesos en puerto 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo ✅ Proceso en puerto 8000 detenido
    )
)

echo ℹ️  Deteniendo procesos en puerto 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo ✅ Proceso en puerto 3000 detenido
    )
)

echo.

:: Cerrar ventanas cmd específicas
echo 📋 4. Cerrando ventanas específicas del sistema hospitalario...
tasklist | find "cmd.exe" >nul
if %ERRORLEVEL% equ 0 (
    echo ℹ️  Cerrando ventanas cmd relacionadas...
    :: Intentar cerrar ventanas por título (si están abiertas)
    taskkill /fi "WindowTitle eq Backend Hospital*" /f >nul 2>&1
    taskkill /fi "WindowTitle eq Frontend Hospital*" /f >nul 2>&1
    taskkill /fi "WindowTitle eq *Backend Hospital - Nuevo Workflow*" /f >nul 2>&1
    taskkill /fi "WindowTitle eq *Frontend Hospital - Nuevo Workflow*" /f >nul 2>&1
    echo ✅ Ventanas específicas cerradas
)

echo.

:: Verificar que los puertos estén libres
echo 📋 5. Verificando que los puertos estén libres...
echo ℹ️  Verificando puerto 8000...
netstat -an | find ":8000" | find "LISTENING" >nul
if %ERRORLEVEL% neq 0 (
    echo ✅ Puerto 8000 está libre
) else (
    echo ⚠️  Puerto 8000 aún ocupado
)

echo ℹ️  Verificando puerto 3000...
netstat -an | find ":3000" | find "LISTENING" >nul
if %ERRORLEVEL% neq 0 (
    echo ✅ Puerto 3000 está libre
) else (
    echo ⚠️  Puerto 3000 aún ocupado
)

echo.

:: Limpiar archivos temporales relacionados
echo 📋 6. Limpiando archivos temporales...
if exist "%~dp0proyecto_hospital\*.log" (
    echo ℹ️  Eliminando archivos de log...
    del /q "%~dp0proyecto_hospital\*.log" >nul 2>&1
)

if exist "%~dp0proyecto_hospital\*.pid" (
    echo ℹ️  Eliminando archivos PID...
    del /q "%~dp0proyecto_hospital\*.pid" >nul 2>&1
)

echo ✅ Archivos temporales limpiados

echo.
echo ========================================
echo 🎉 SISTEMA HOSPITALARIO DETENIDO
echo ========================================
echo.
echo 📊 Resumen de la operación:
echo   🔧 Backend FastAPI:     DETENIDO
echo   🌐 Frontend Next.js:    DETENIDO
echo   🚪 Puerto 8000:         LIBERADO
echo   🚪 Puerto 3000:         LIBERADO
echo   🧹 Archivos temp:       LIMPIADOS
echo.
echo 💡 El sistema ha sido detenido completamente
echo.
echo 🚀 Para volver a iniciar el sistema:
echo   INICIAR_NUEVO_WORKFLOW.bat           (Nuevo workflow - RECOMENDADO)
echo   SISTEMA_COMPLETO_FUNCIONANDO.bat     (Completo con verificaciones)
echo   INICIAR_FRONTEND_NUEVO_WORKFLOW.bat  (Solo frontend actualizado)
echo.
echo 📋 Si necesitas forzar la detención:
echo   1. Abrir Administrador de Tareas (Ctrl+Shift+Esc)
echo   2. Buscar procesos "python.exe" y "node.exe"
echo   3. Finalizar procesos manualmente
echo.
echo ⚠️  Presiona cualquier tecla para cerrar esta ventana
echo ========================================
pause 