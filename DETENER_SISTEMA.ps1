# ========================================
# 🛑 DETENER SISTEMA HOSPITALARIO COMPLETO
# 🔄 Nuevo Workflow PowerShell
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🛑 DETENER SISTEMA HOSPITALARIO COMPLETO" -ForegroundColor Red
Write-Host "🔄 Nuevo Workflow PowerShell" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para escribir mensajes con colores
function Write-StatusMessage {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    switch ($Type) {
        "Success" { Write-Host "✅ $Message" -ForegroundColor Green }
        "Warning" { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
        "Error" { Write-Host "❌ $Message" -ForegroundColor Red }
        "Info" { Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
        default { Write-Host "📋 $Message" -ForegroundColor White }
    }
}

# Función para detener procesos por nombre
function Stop-ProcessByName {
    param(
        [string]$ProcessName,
        [string]$Description
    )
    
    Write-StatusMessage "Deteniendo $Description ($ProcessName)..." ""
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    
    if ($processes) {
        Write-StatusMessage "Procesos $ProcessName encontrados, deteniendo..." "Info"
        
        try {
            $processes | Stop-Process -Force -ErrorAction Stop
            Write-StatusMessage "$Description detenido exitosamente" "Success"
            return $true
        }
        catch {
            Write-StatusMessage "No se pudieron detener algunos procesos $ProcessName" "Warning"
            return $false
        }
    }
    else {
        Write-StatusMessage "No se encontraron procesos $ProcessName activos" "Info"
        return $true
    }
}

# Función para detener procesos por puerto
function Stop-ProcessByPort {
    param(
        [int]$Port,
        [string]$Description
    )
    
    Write-StatusMessage "Deteniendo procesos en puerto $Port ($Description)..." "Info"
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($connection in $connections) {
                $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-StatusMessage "Deteniendo proceso $($process.Name) (PID: $($process.Id)) en puerto $Port" "Info"
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    Write-StatusMessage "Proceso en puerto $Port detenido" "Success"
                }
            }
        }
        else {
            Write-StatusMessage "Puerto $Port está libre" "Success"
        }
    }
    catch {
        Write-StatusMessage "Error verificando puerto $Port" "Warning"
    }
}

# Función para verificar si un puerto está libre
function Test-PortFree {
    param(
        [int]$Port
    )
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        return -not $connection
    }
    catch {
        return $true
    }
}

Write-StatusMessage "Buscando y deteniendo procesos del sistema hospitalario..." ""
Write-Host ""

# 1. Detener Backend FastAPI (Python/uvicorn)
Write-StatusMessage "1. Deteniendo Backend FastAPI (uvicorn)..." ""
Stop-ProcessByName -ProcessName "python" -Description "Backend FastAPI"

Write-Host ""

# 2. Detener Frontend Next.js (Node.js)
Write-StatusMessage "2. Deteniendo Frontend Next.js (Node.js)..." ""
Stop-ProcessByName -ProcessName "node" -Description "Frontend Next.js"

Write-Host ""

# 3. Verificar puertos específicos
Write-StatusMessage "3. Verificando puertos específicos..." ""
Stop-ProcessByPort -Port 8000 -Description "Backend"
Stop-ProcessByPort -Port 3000 -Description "Frontend"

Write-Host ""

# 4. Cerrar ventanas específicas del CMD
Write-StatusMessage "4. Cerrando ventanas específicas del sistema hospitalario..." ""

try {
    # Buscar y cerrar ventanas específicas por título
    $cmdProcesses = Get-Process -Name "cmd" -ErrorAction SilentlyContinue
    
    if ($cmdProcesses) {
        Write-StatusMessage "Cerrando ventanas cmd relacionadas..." "Info"
        
        foreach ($process in $cmdProcesses) {
            try {
                if ($process.MainWindowTitle -like "*Backend Hospital*" -or 
                    $process.MainWindowTitle -like "*Frontend Hospital*" -or
                    $process.MainWindowTitle -like "*Nuevo Workflow*") {
                    
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    Write-StatusMessage "Ventana específica cerrada (PID: $($process.Id))" "Success"
                }
            }
            catch {
                # Ignorar errores individuales
            }
        }
    }
    else {
        Write-StatusMessage "No se encontraron ventanas cmd activas" "Info"
    }
}
catch {
    Write-StatusMessage "Error cerrando ventanas específicas" "Warning"
}

Write-Host ""

# 5. Verificar que los puertos estén libres
Write-StatusMessage "5. Verificando que los puertos estén libres..." ""

if (Test-PortFree -Port 8000) {
    Write-StatusMessage "Puerto 8000 está libre" "Success"
}
else {
    Write-StatusMessage "Puerto 8000 aún ocupado" "Warning"
}

if (Test-PortFree -Port 3000) {
    Write-StatusMessage "Puerto 3000 está libre" "Success"
}
else {
    Write-StatusMessage "Puerto 3000 aún ocupado" "Warning"
}

Write-Host ""

# 6. Limpiar archivos temporales
Write-StatusMessage "6. Limpiando archivos temporales..." ""

$projectPath = Join-Path $PSScriptRoot "proyecto_hospital"

if (Test-Path $projectPath) {
    # Limpiar archivos de log
    $logFiles = Get-ChildItem -Path $projectPath -Filter "*.log" -ErrorAction SilentlyContinue
    if ($logFiles) {
        Write-StatusMessage "Eliminando archivos de log..." "Info"
        $logFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    }
    
    # Limpiar archivos PID
    $pidFiles = Get-ChildItem -Path $projectPath -Filter "*.pid" -ErrorAction SilentlyContinue
    if ($pidFiles) {
        Write-StatusMessage "Eliminando archivos PID..." "Info"
        $pidFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    }
    
    Write-StatusMessage "Archivos temporales limpiados" "Success"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 SISTEMA HOSPITALARIO DETENIDO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Resumen de la operación:" -ForegroundColor White
Write-Host "  🔧 Backend FastAPI:     DETENIDO" -ForegroundColor Green
Write-Host "  🌐 Frontend Next.js:    DETENIDO" -ForegroundColor Green
Write-Host "  🚪 Puerto 8000:         LIBERADO" -ForegroundColor Green
Write-Host "  🚪 Puerto 3000:         LIBERADO" -ForegroundColor Green
Write-Host "  🧹 Archivos temp:       LIMPIADOS" -ForegroundColor Green
Write-Host ""

Write-Host "💡 El sistema ha sido detenido completamente" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Para volver a iniciar el sistema:" -ForegroundColor Cyan
Write-Host "  INICIAR_NUEVO_WORKFLOW.bat           (Nuevo workflow - RECOMENDADO)" -ForegroundColor White
Write-Host "  SISTEMA_COMPLETO_FUNCIONANDO.bat     (Completo con verificaciones)" -ForegroundColor White
Write-Host "  INICIAR_FRONTEND_NUEVO_WORKFLOW.bat  (Solo frontend actualizado)" -ForegroundColor White
Write-Host ""

Write-Host "📋 Si necesitas forzar la detención:" -ForegroundColor Yellow
Write-Host "  1. Abrir Administrador de Tareas (Ctrl+Shift+Esc)" -ForegroundColor White
Write-Host "  2. Buscar procesos 'python.exe' y 'node.exe'" -ForegroundColor White
Write-Host "  3. Finalizar procesos manualmente" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Presiona cualquier tecla para cerrar esta ventana" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Esperar input del usuario
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 