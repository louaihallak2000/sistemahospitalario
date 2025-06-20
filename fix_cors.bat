@echo off
echo 🛠️ SOLUCIONANDO PROBLEMAS DE CORS Y NETWORKERROR
echo ============================================
echo.

echo 🛑 DETENIENDO TODOS LOS SERVICIOS...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 3 >nul

echo.
echo 🐍 INICIANDO BACKEND CON CORS HABILITADO...
cd proyecto_hospital
start "Backend - FastAPI" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo ⏳ Esperando que el backend inicie completamente...
timeout /t 7 >nul

echo.
echo 🌐 INICIANDO FRONTEND...
cd frontend
start "Frontend - Next.js" cmd /k "npm run dev"

echo.
echo ⏳ Esperando que el frontend inicie...
timeout /t 7 >nul

cd ..
cd ..

echo.
echo 🔍 VERIFICANDO SERVICIOS...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/health' -UseBasicParsing; Write-Host '✅ Backend OK:' $r.StatusCode } catch { Write-Host '❌ Backend Error:' $_.Exception.Message }"
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ Frontend OK:' $r.StatusCode } catch { Write-Host '❌ Frontend Error:' $_.Exception.Message }"

echo.
echo 📋 INSTRUCCIONES:
echo ================
echo.
echo 1. ABRE Chrome/Edge con seguridad deshabilitada para desarrollo:
echo    "chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome_dev"
echo.
echo 2. O usa el siguiente comando PowerShell para test rápido:
echo    Start-Process "chrome.exe" -ArgumentList "--disable-web-security", "--user-data-dir=C:\temp\chrome_dev", "http://localhost:3000"
echo.
echo 3. ALTERNATIVAMENTE, abre http://localhost:3000 en modo incógnito
echo.
echo 4. Si persiste el error, revisa:
echo    - Backend logs en la ventana "Backend - FastAPI"
echo    - Frontend logs en la ventana "Frontend - Next.js"
echo.
pause 