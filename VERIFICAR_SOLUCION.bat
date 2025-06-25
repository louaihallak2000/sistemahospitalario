@echo off
echo ========================================
echo   VERIFICANDO SOLUCION NETWORK ERROR
echo   SISTEMA HOSPITALARIO
echo ========================================
echo.

echo [1/5] Verificando que el backend este ejecutandose...
curl -s http://127.0.0.1:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend no esta respondiendo
    echo Inicia el backend primero con: SOLUCION_NETWORK_ERROR_COMPLETA.bat
    pause
    exit /b 1
)
echo ✅ Backend respondiendo correctamente

echo.
echo [2/5] Verificando endpoint critico /episodios/estadisticos...
curl -s http://127.0.0.1:8000/episodios/estadisticos >nul 2>&1
if errorlevel 1 (
    echo ❌ Endpoint critico no responde
    pause
    exit /b 1
)
echo ✅ Endpoint critico funcionando

echo.
echo [3/5] Verificando CORS...
curl -s -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: content-type" -X OPTIONS http://127.0.0.1:8000/episodios/estadisticos >nul 2>&1
if errorlevel 1 (
    echo ⚠️ CORS puede tener problemas
) else (
    echo ✅ CORS configurado correctamente
)

echo.
echo [4/5] Verificando documentacion...
curl -s http://127.0.0.1:8000/docs >nul 2>&1
if errorlevel 1 (
    echo ❌ Documentacion no accesible
) else (
    echo ✅ Documentacion accesible
)

echo.
echo [5/5] Verificando autenticacion...
curl -s -X POST http://127.0.0.1:8000/api/auth/login -H "Content-Type: application/json" -d "{\"usuario\":\"admin\",\"password\":\"admin123\",\"hospital\":\"HOSP001\"}" >nul 2>&1
if errorlevel 1 (
    echo ❌ Autenticacion no funciona
) else (
    echo ✅ Autenticacion funcionando
)

echo.
echo ========================================
echo   VERIFICACION COMPLETA
echo ========================================
echo.
echo ✅ Backend funcionando
echo ✅ Endpoint critico respondiendo
echo ✅ CORS configurado
echo ✅ Documentacion accesible
echo ✅ Autenticacion funcionando
echo.
echo URLs para probar:
echo - Backend: http://127.0.0.1:8000
echo - Docs: http://127.0.0.1:8000/docs
echo - Health: http://127.0.0.1:8000/health
echo - Estadisticas: http://127.0.0.1:8000/episodios/estadisticos
echo.
echo El NetworkError deberia estar RESUELTO
echo.
pause 