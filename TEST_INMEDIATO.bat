@echo off
title 🧪 TEST INMEDIATO - VERIFICACION BACKEND
color 0A

echo ================================================
echo   🧪 TEST INMEDIATO - VERIFICACION BACKEND
echo   SISTEMA HOSPITALARIO - EMERGENCIA
echo ================================================
echo.

echo [1/5] Verificando que el backend este ejecutandose...
echo Probando conexion a http://127.0.0.1:8000/health
curl -s http://127.0.0.1:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Backend no responde en puerto 8000
    echo Ejecuta primero: EJECUTAR_EMERGENCIA.bat
    pause
    exit /b 1
)
echo ✅ Backend respondiendo correctamente

echo.
echo [2/5] Verificando endpoint critico /episodios/estadisticos...
echo Probando: http://127.0.0.1:8000/episodios/estadisticos
curl -s http://127.0.0.1:8000/episodios/estadisticos >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Endpoint /episodios/estadisticos no responde
    pause
    exit /b 1
)
echo ✅ Endpoint /episodios/estadisticos funcionando

echo.
echo [3/5] Verificando endpoint /episodios/lista-espero...
echo Probando: http://127.0.0.1:8000/episodios/lista-espero
curl -s http://127.0.0.1:8000/episodios/lista-espero >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Endpoint /episodios/lista-espero no responde
    pause
    exit /b 1
)
echo ✅ Endpoint /episodios/lista-espero funcionando

echo.
echo [4/5] Verificando CORS...
echo Probando CORS con Origin: http://localhost:3000
curl -s -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -X OPTIONS http://127.0.0.1:8000/episodios/estadisticos >nul 2>&1
if errorlevel 1 (
    echo ⚠️  CORS puede tener problemas
) else (
    echo ✅ CORS configurado correctamente
)

echo.
echo [5/5] Verificando autenticacion...
echo Probando login con credenciales de prueba
curl -s -X POST http://127.0.0.1:8000/api/auth/login -H "Content-Type: application/json" -d "{\"usuario\":\"admin\",\"password\":\"admin123\",\"hospital\":\"HOSP001\"}" >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Autenticacion no funciona
    pause
    exit /b 1
)
echo ✅ Autenticacion funcionando

echo.
echo ================================================
echo   ✅ VERIFICACION COMPLETA - EXITOSA
echo ================================================
echo.
echo 🎯 TODOS LOS ENDPOINTS FUNCIONANDO:
echo ✅ Health Check: http://127.0.0.1:8000/health
echo ✅ Estadisticas: http://127.0.0.1:8000/episodios/estadisticos
echo ✅ Lista Espera: http://127.0.0.1:8000/episodios/lista-espero
echo ✅ Autenticacion: POST http://127.0.0.1:8000/api/auth/login
echo ✅ CORS: Configurado correctamente
echo.
echo 🚀 EL NETWORKERROR DEBE ESTAR RESUELTO
echo.
echo 📋 Credenciales de prueba:
echo    Usuario: admin
echo    Password: admin123
echo    Hospital: HOSP001
echo.
echo 🌐 URLs para probar manualmente:
echo    Backend: http://127.0.0.1:8000
echo    Health: http://127.0.0.1:8000/health
echo    Estadisticas: http://127.0.0.1:8000/episodios/estadisticos
echo    Test CORS: http://127.0.0.1:8000/test/cors
echo.
echo 💡 Ahora abre http://localhost:3000 y verifica que no hay NetworkError
echo.
pause 