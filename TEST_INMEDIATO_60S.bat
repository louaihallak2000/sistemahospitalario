@echo off
title TEST INMEDIATO - VERIFICACION 60S
color 0B

echo ================================================
echo   🧪 TEST INMEDIATO - VERIFICACION 60S  
echo ================================================
echo.

echo [1] 🔍 Verificando puerto 8000...
netstat -ano | findstr :8000
if errorlevel 1 (
    echo ❌ Puerto 8000 no está ocupado
    echo 🚨 EJECUTA PRIMERO: EJECUTAR_EMERGENCIA.bat
    pause
    exit /b 1
) else (
    echo ✅ Puerto 8000 está ocupado (CORRECTO)
)

echo.
echo [2] 🌐 Testeando endpoints críticos...

echo.
echo 📍 Testeando /health...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/health' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ /health - Status:' $r.StatusCode } catch { Write-Host '❌ /health - FALLO:' $_.Exception.Message }"

echo.
echo 📍 Testeando /episodios/estadisticos...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/episodios/estadisticos' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ /episodios/estadisticos - Status:' $r.StatusCode } catch { Write-Host '❌ /episodios/estadisticos - FALLO:' $_.Exception.Message }"

echo.
echo 📍 Testeando /episodios/lista-espero...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/episodios/lista-espero' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ /episodios/lista-espero - Status:' $r.StatusCode } catch { Write-Host '❌ /episodios/lista-espero - FALLO:' $_.Exception.Message }"

echo.
echo 📍 Testeando CORS...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/health' -Headers @{'Origin'='http://localhost:3000'} -UseBasicParsing -TimeoutSec 5; Write-Host '✅ CORS - Status:' $r.StatusCode } catch { Write-Host '❌ CORS - FALLO:' $_.Exception.Message }"

echo.
echo [3] 🚀 Abriendo URLs de verificación...
start "" "http://127.0.0.1:8000/health"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8000/episodios/estadisticos"

echo.
echo ================================================
echo   ✅ VERIFICACION COMPLETADA
echo ================================================
echo.
echo 🎯 SI TODOS LOS TESTS MUESTRAN "✅":
echo    - El backend está funcionando
echo    - CORS está habilitado  
echo    - NetworkError debe desaparecer
echo.
echo 🎯 SI HAY "❌":
echo    - Reinicia: EJECUTAR_EMERGENCIA.bat
echo    - Verifica: Antivirus no bloquee Python
echo.
echo 🌐 Ahora ve a: http://localhost:3000
echo 🔍 Verifica: Consola del navegador (F12)
echo 📊 Resultado: NO debe haber NetworkError
echo.
pause 