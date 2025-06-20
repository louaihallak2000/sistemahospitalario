# 🚀 INSTRUCCIONES DE INICIO - SISTEMA HOSPITALARIO

## 🎯 PROBLEMA SOLUCIONADO
El backend no se puede iniciar automáticamente desde scripts. **SOLUCIÓN**: Inicio manual con scripts dedicados.

## ⚡ INICIO RÁPIDO (2 PASOS)

### **PASO 1: Iniciar Backend** 
```bash
# Doble clic en:
INICIAR_SISTEMA.bat
```
- Se abrirá una ventana de terminal
- Verás "✅ Backend iniciado en http://127.0.0.1:8000"
- **MANTENER ABIERTA** esta ventana

### **PASO 2: Iniciar Frontend**
```bash
# Doble clic en:
INICIAR_FRONTEND.bat
```
- Se abrirá otra ventana de terminal
- Verás "✅ Frontend iniciado en http://localhost:3000"
- **MANTENER ABIERTA** esta ventana

## 🌐 URLS DEL SISTEMA
- **Frontend**: http://localhost:3000
- **Backend**: http://127.0.0.1:8000  
- **API Docs**: http://127.0.0.1:8000/docs

## 🔐 CREDENCIALES DE PRUEBA
```
Usuario:     admin
Contraseña:  admin123
Hospital:    HOSP001
```

### **Otros usuarios disponibles:**
- `medico1/medico123` (HOSP001)
- `enfermera1/enfermera123` (HOSP001)
- `admin2/admin456` (HOSP002)

## 🔧 INICIO MANUAL ALTERNATIVO

### **Opción A: Comandos directos**
```bash
# Terminal 1 - Backend
cd "C:\Users\louaii\Desktop\sistema hopitalario definitivo\proyecto_hospital"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 - Frontend
cd "C:\Users\louaii\Desktop\sistema hopitalario definitivo\proyecto_hospital\frontend"
npm run dev
```

### **Opción B: Scripts individuales**
1. **Backend**: `INICIAR_SISTEMA.bat`
2. **Frontend**: `INICIAR_FRONTEND.bat`

## 🎯 VERIFICACIÓN DE FUNCIONAMIENTO

### **Backend funcionando:**
- ✅ Ventana muestra "Uvicorn running on http://127.0.0.1:8000"
- ✅ http://127.0.0.1:8000 responde con JSON
- ✅ http://127.0.0.1:8000/docs muestra documentación

### **Frontend funcionando:**
- ✅ Ventana muestra "ready - started server on 0.0.0.0:3000"
- ✅ http://localhost:3000 muestra pantalla de login
- ✅ Sin errores "NetworkError" en consola

### **Sistema completo:**
- ✅ Login con admin/admin123/HOSP001 funciona
- ✅ Dashboard muestra lista de espera
- ✅ Botones responden sin errores
- ✅ **NAVEGACIÓN AUTOMÁTICA** después de altas

## 🔄 NAVEGACIÓN AUTOMÁTICA IMPLEMENTADA
- ✅ **Alta médica** → regresa automáticamente al dashboard
- ✅ **Internación** → regresa automáticamente al dashboard  
- ✅ **Lista de espera** se actualiza automáticamente
- ✅ **Sin navegación manual** requerida

## 🚨 SOLUCIÓN DE PROBLEMAS

### **Si el backend no inicia:**
```bash
python diagnostico_backend.py
```

### **Si dice "Puerto ocupado":**
```bash
# Terminar procesos en puerto 8000
netstat -ano | findstr :8000
taskkill /F /PID [PID_NUMBER]
```

### **Si faltan dependencias:**
```bash
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart
```

### **Si no existe la base de datos:**
```bash
python init_db.py
```

## ✅ CONFIRMACIÓN FINAL
Una vez que ambos servicios estén funcionando:

1. **Ve a**: http://localhost:3000
2. **Login**: admin/admin123/HOSP001
3. **Selecciona un paciente** de la lista de espera
4. **Prueba dar de alta** → debería regresar automáticamente al dashboard
5. **✅ SISTEMA COMPLETAMENTE FUNCIONAL**

---
**Status**: ✅ Solución completada
**Navegación automática**: ✅ Implementada
**Backend**: ✅ Preparado para inicio manual
**Frontend**: ✅ Preparado para inicio manual 