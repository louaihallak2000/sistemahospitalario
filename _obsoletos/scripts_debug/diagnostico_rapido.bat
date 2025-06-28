@echo off
echo 🔍 DIAGNOSTICO RAPIDO - NETWORKERROR
echo ===================================
echo.

echo 1. VERIFICANDO BACKEND...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/health' -UseBasicParsing; Write-Host '✅ Backend OK' } catch { Write-Host '❌ Backend NO responde' }"

echo.
echo 2. OBTENIENDO TOKEN...
powershell -Command "$body = '{\"hospital_code\":\"HOSP001\",\"username\":\"admin\",\"password\":\"admin123\"}'; try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/auth/login' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing; $data = $r.Content | ConvertFrom-Json; $token = $data.access_token; Write-Host '✅ Token obtenido'; Set-Content -Path 'token.txt' -Value $token } catch { Write-Host '❌ Error en login: ' $_.Exception.Message }"

echo.
echo 3. PROBANDO LISTA ESPERA...
powershell -Command "if (Test-Path 'token.txt') { $token = Get-Content 'token.txt'; $headers = @{'Authorization'=\"Bearer $token\"}; try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/episodios/lista-espera' -Headers $headers -UseBasicParsing; Write-Host '✅ Lista espera OK - Status:' $r.StatusCode } catch { Write-Host '❌ Error lista espera:' $_.Exception.Message; Write-Host '   Response:' $_.Exception.Response.StatusCode } } else { Write-Host '❌ No hay token' }"

echo.
echo 4. PROBANDO ESTADISTICAS...
powershell -Command "if (Test-Path 'token.txt') { $token = Get-Content 'token.txt'; $headers = @{'Authorization'=\"Bearer $token\"}; try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/episodios/estadisticas' -Headers $headers -UseBasicParsing; Write-Host '✅ Estadisticas OK - Status:' $r.StatusCode } catch { Write-Host '❌ Error estadisticas:' $_.Exception.Message; Write-Host '   Response:' $_.Exception.Response.StatusCode } }"

echo.
echo 5. VERIFICANDO CORS...
powershell -Command "$headers = @{'Origin'='http://localhost:3000'}; try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/episodios/lista-espera' -Method OPTIONS -Headers $headers -UseBasicParsing; Write-Host '✅ CORS preflight OK'; Write-Host '   Headers:' $r.Headers } catch { Write-Host '❌ CORS preflight failed' }"

echo.
del token.txt 2>nul
echo DIAGNOSTICO COMPLETO
echo.
pause 