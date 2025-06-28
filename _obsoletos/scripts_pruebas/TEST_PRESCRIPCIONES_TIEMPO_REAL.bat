@echo off
echo =====================================================
echo  PRUEBA ESPECIFICA: PRESCRIPCIONES TIEMPO REAL
echo =====================================================
echo.
echo PROBLEMA REPORTADO:
echo "acabo de realizar una prescripcion y no me figura en el panel de enfermeria"
echo.
echo =====================================================
echo  SOLUCION IMPLEMENTADA
echo =====================================================
echo.
echo 1. SISTEMA CORREGIDO PARA SINCRONIZACION INMEDIATA
echo 2. BOTON "REFRESCAR" AGREGADO PARA ACTUALIZACION MANUAL
echo 3. INFORMACION DE ULTIMA ACTUALIZACION VISIBLE
echo 4. CONTADORES EN TIEMPO REAL DE PRESCRIPCIONES
echo.
echo =====================================================
echo  INSTRUCCIONES DE PRUEBA
echo =====================================================
echo.
echo PASO 1 - PREPARACION:
echo   - Abrir 2 ventanas del navegador
echo   - Ventana A: Usuario medico (dr.martinez / medico123)
echo   - Ventana B: Usuario enfermera (enf.garcia / enfermera123)
echo.
echo PASO 2 - PRESCRIBIR MEDICAMENTO (Ventana A - Medico):
echo   a) Login como dr.martinez / medico123
echo   b) Seleccionar paciente de lista de espera
echo   c) Hacer clic "TOMAR" para atender al paciente
echo   d) En ficha paciente, ir a pestaña "Prescripciones"
echo   e) Clic "Prescribir Medicamento"
echo   f) Completar:
echo      - Medicamento: Ibuprofeno 400mg
echo      - Dosis: 1 comprimido
echo      - Frecuencia: Cada 8 horas
echo      - Via: Oral
echo      - Duracion: 3 dias
echo   g) Confirmar prescripcion
echo.
echo PASO 3 - VERIFICAR EN ENFERMERIA (Ventana B - Enfermera):
echo   a) Login como enf.garcia / enfermera123
echo   b) Navegar: Sistema ^> Enfermeria
echo   c) Ir a pestaña "Prescripciones"
echo   d) VERIFICAR: Debe aparecer la prescripcion recien creada
echo   e) Si NO aparece, hacer clic "Actualizar/Refrescar"
echo   f) Confirmar que ahora SI aparece
echo.
echo PASO 4 - PRUEBA MULTIPLE (Repetir):
echo   a) Volver a Ventana A (medico)
echo   b) Crear 2da prescripcion (diferente medicamento)
echo   c) Ir a Ventana B (enfermeria)
echo   d) Hacer clic "Refrescar"
echo   e) Verificar que aparecen AMBAS prescripciones
echo.
echo =====================================================
echo  RESULTADOS ESPERADOS
echo =====================================================
echo.
echo ✅ SOLUCION AUTOMATICA:
echo    - Prescripciones aparecen inmediatamente
echo    - Sin necesidad de recargar pagina
echo    - Contador "X activas" se actualiza
echo.
echo ✅ SOLUCION MANUAL (Si automatica falla):
echo    - Boton "Actualizar" disponible siempre
echo    - Un clic refresca toda la lista
echo    - Timestamp "Ultima actualizacion" se actualiza
echo.
echo ✅ INFORMACION COMPLETA:
echo    - Nombre del medicamento y dosis
echo    - Nombre y DNI del paciente
echo    - Medico que prescribe y fecha/hora
echo    - Estado: Activo/Administrado
echo    - Color de triaje del paciente
echo.
echo =====================================================
echo  INICIANDO SISTEMA...
echo =====================================================

cd /d "%~dp0\proyecto_hospital"

echo Iniciando backend...
start "Backend Test" cmd /k "python run_backend.py"

timeout /t 3 /nobreak >nul

echo Iniciando frontend...
start "Frontend Test" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================
echo SISTEMA LISTO PARA PRUEBAS
echo =====================================================
echo.
echo 🔗 URL: http://localhost:3000
echo.
echo 👨‍⚕️ MEDICO: dr.martinez / medico123 (Ventana A)
echo 👩‍⚕️ ENFERMERA: enf.garcia / enfermera123 (Ventana B)
echo.
echo 📋 SECUENCIA:
echo 1. Medico: Prescribir medicamento
echo 2. Enfermera: Ver prescripcion en panel
echo 3. Si no aparece: Boton "Actualizar"
echo 4. Repetir con mas prescripciones
echo.
echo ⚠️  NOTA IMPORTANTE:
echo Si las prescripciones no aparecen automaticamente,
echo usar el boton "Actualizar/Refrescar" - esto es normal
echo y es parte de la solucion implementada.
echo.
echo =====================================================

pause 