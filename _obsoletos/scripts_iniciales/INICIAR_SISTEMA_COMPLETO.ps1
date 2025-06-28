# Script PowerShell para iniciar el Sistema Hospitalario
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SISTEMA HOSPITALARIO COMPLETO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "proyecto_hospital")) {
    Write-Host "Error: Debe ejecutar desde el directorio raiz del proyecto" -ForegroundColor Red
    Write-Host "   Directorio actual: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "   Ejecute desde: sistema hopitalario definitivo\" -ForegroundColor Yellow
    pause
    exit 1
}

try {
    Write-Host "1. Inicializando Base de Datos..." -ForegroundColor Yellow
    Set-Location "proyecto_hospital"
    
    $initDb = Start-Process python -ArgumentList "init_db.py" -Wait -PassThru -NoNewWindow
    if ($initDb.ExitCode -ne 0) {
        throw "Error inicializando base de datos"
    }
    Write-Host "Base de datos inicializada" -ForegroundColor Green

    Write-Host ""
    Write-Host "2. Inicializando Shockroom..." -ForegroundColor Yellow
    $initShock = Start-Process python -ArgumentList "init_shockroom.py" -Wait -PassThru -NoNewWindow
    if ($initShock.ExitCode -ne 0) {
        throw "Error inicializando shockroom"
    }
    Write-Host "Shockroom inicializado" -ForegroundColor Green

    Write-Host ""
    Write-Host "3. Iniciando Backend..." -ForegroundColor Yellow
    $backend = Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000" -WindowStyle Normal
    Write-Host "Backend iniciado en proceso $($backend.Id)" -ForegroundColor Green

    Write-Host ""
    Write-Host "4. Iniciando Frontend..." -ForegroundColor Yellow
    Set-Location "frontend"
    $frontend = Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal
    Write-Host "Frontend iniciado en proceso $($frontend.Id)" -ForegroundColor Green

    Write-Host ""
    Write-Host "Esperando 20 segundos para que los servicios se inicien..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20

    Write-Host ""
    Write-Host "Verificando servicios..." -ForegroundColor Yellow
    
    # Verificar puerto 8000
    $backend_running = netstat -ano | Select-String ":8000.*LISTENING"
    if ($backend_running) {
        Write-Host "Backend corriendo en puerto 8000" -ForegroundColor Green
    }
    else {
        Write-Host "Backend no detectado en puerto 8000" -ForegroundColor Yellow
    }

    # Verificar puerto 3000
    $frontend_running = netstat -ano | Select-String ":3000.*LISTENING"
    if ($frontend_running) {
        Write-Host "Frontend corriendo en puerto 3000" -ForegroundColor Green
    }
    else {
        Write-Host "Frontend no detectado en puerto 3000" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "URLs del Sistema:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend:  http://127.0.0.1:8000" -ForegroundColor White
    Write-Host "   API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Credenciales de prueba:" -ForegroundColor Cyan
    Write-Host "   Usuario: admin" -ForegroundColor White
    Write-Host "   Contraseña: admin123" -ForegroundColor White
    Write-Host "   Hospital: Hospital Central San Juan" -ForegroundColor White

    Write-Host ""
    Write-Host "Abriendo navegador..." -ForegroundColor Yellow
    Start-Process "http://localhost:3000"

    Write-Host ""
    Write-Host "Sistema hospitalario iniciado completamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para detener el sistema:" -ForegroundColor Cyan
    Write-Host "   Opcion 1: .\DETENER_SISTEMA_HOSPITALARIO_COMPLETO.bat" -ForegroundColor White
    Write-Host "   Opcion 2: .\DETENER_SISTEMA.ps1" -ForegroundColor White

}
catch {
    Write-Host ""
    Write-Host "Error durante la inicializacion: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Intente ejecutar manualmente:" -ForegroundColor Yellow
    Write-Host "   1. cd proyecto_hospital" -ForegroundColor White
    Write-Host "   2. python init_db.py" -ForegroundColor White
    Write-Host "   3. python init_shockroom.py" -ForegroundColor White
    Write-Host "   4. python -m uvicorn app.main:app --host 0.0.0.0 --port 8000" -ForegroundColor White
}
finally {
    # Volver al directorio original
    Set-Location ..
}

Write-Host ""
Write-Host "Presione cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 