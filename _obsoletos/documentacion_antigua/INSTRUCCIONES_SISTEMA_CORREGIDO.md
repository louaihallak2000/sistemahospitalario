# 🏥 Sistema Hospitalario - Instrucciones de Uso

## 🚀 Inicio Rápido

### Opción 1: Usar Scripts Batch (Recomendado)
```bash
# 1. Instalar dependencias (primera vez solamente)
INSTALAR_DEPENDENCIAS.bat

# 2. Iniciar el sistema completo
INICIAR_SISTEMA_CORREGIDO.bat

# 3. Detener el sistema cuando termines
DETENER_SISTEMA.bat
```

### Opción 2: Usar NPM (Alternativo)
```bash
# 1. Instalar concurrently (primera vez)
npm install

# 2. Iniciar sistema completo
npm run dev

# 3. Detener con Ctrl+C
```

### Opción 3: Manual (Desarrollo)
```bash
# Terminal 1 - Backend
cd proyecto_hospital
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 - Frontend
cd proyecto_hospital/frontend
npm run dev
```

## 🔧 Configuración Inicial

### Requisitos del Sistema
- **Python 3.8+** (Backend)
- **Node.js 18+** (Frontend)
- **Git** (Control de versiones)

### Verificar Instalación
```bash
python --version    # Debe mostrar 3.8+
node --version      # Debe mostrar 18+
npm --version       # Cualquier versión reciente
```

## 🌐 URLs del Sistema

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Aplicación principal |
| **Backend** | http://127.0.0.1:8000 | API REST |
| **Docs API** | http://127.0.0.1:8000/docs | Documentación Swagger |

## 🔐 Credenciales de Acceso

```
Usuario: admin
Contraseña: admin123
Hospital: HOSP001
```

## 📁 Estructura del Proyecto

```
sistema-hospitalario/
├── 📁 proyecto_hospital/          # Proyecto principal
│   ├── 📁 app/                    # Backend FastAPI
│   │   ├── api/v1/               # Endpoints API
│   │   ├── core/                 # Configuración
│   │   ├── models/               # Modelos SQLAlchemy
│   │   ├── schemas/              # Schemas Pydantic
│   │   └── main.py               # Punto de entrada
│   └── 📁 frontend/              # Frontend Next.js
│       ├── components/           # Componentes React
│       ├── app/                  # Páginas Next.js
│       └── package.json          # Dependencias
├── 🔧 INICIAR_SISTEMA_CORREGIDO.bat    # Script principal
├── 🔧 INSTALAR_DEPENDENCIAS.bat        # Instalar deps
├── 🔧 DETENER_SISTEMA.bat              # Detener sistema
└── 📦 package.json                     # Config NPM raíz
```

## 🛠️ Scripts Disponibles

### Scripts Batch (Windows)
- `INSTALAR_DEPENDENCIAS.bat` - Instala todas las dependencias
- `INICIAR_SISTEMA_CORREGIDO.bat` - Inicia el sistema completo
- `DETENER_SISTEMA.bat` - Detiene todos los procesos

### Scripts NPM (Multiplataforma)
- `npm run dev` - Inicia backend + frontend
- `npm run backend` - Solo backend
- `npm run frontend` - Solo frontend
- `npm run setup` - Configuración inicial
- `npm run clean` - Limpia procesos

## 🚨 Solución de Problemas

### Error: "Missing script: 'dev'"
**Causa**: Ejecutando npm desde directorio incorrecto
**Solución**: Usar `INICIAR_SISTEMA_CORREGIDO.bat` o ejecutar desde directorio raíz

### Error: "No module named 'app'"
**Causa**: Ejecutando uvicorn desde directorio incorrecto
**Solución**: El script corregido ejecuta desde `proyecto_hospital/`

### Puerto ocupado
**Solución**: Ejecutar `DETENER_SISTEMA.bat` antes de reiniciar

### Dependencias faltantes
**Solución**: Ejecutar `INSTALAR_DEPENDENCIAS.bat`

## 📚 Funcionalidades del Sistema

### 👥 Gestión de Pacientes
- ✅ Registro de nuevos pacientes
- ✅ Búsqueda y filtrado
- ✅ Historial médico
- ✅ Documentos y estudios

### 🚨 Sistema de Triaje
- ✅ Clasificación por prioridad
- ✅ Lista de espera automática
- ✅ Dashboard de estadísticas
- ✅ Alertas y notificaciones

### 👩‍⚕️ Módulo de Enfermería
- ✅ Seguimiento de cuidados
- ✅ Administración de medicamentos
- ✅ Evoluciones médicas
- ✅ Prescripciones

### 🏥 Gestión Hospitalaria
- ✅ Control de admisiones
- ✅ Gestión de altas
- ✅ Derivaciones
- ✅ Estudios complementarios

## 🔄 Actualización del Sistema

```bash
# Obtener últimos cambios
git pull origin main

# Reinstalar dependencias si es necesario
INSTALAR_DEPENDENCIAS.bat

# Reiniciar sistema
INICIAR_SISTEMA_CORREGIDO.bat
```

## 📝 Desarrollo

### Agregar nuevas funcionalidades
1. Backend: Modificar archivos en `proyecto_hospital/app/`
2. Frontend: Modificar archivos en `proyecto_hospital/frontend/`
3. El sistema se recarga automáticamente en modo desarrollo

### Base de datos
- SQLite por defecto (archivo local)
- Modelos en `proyecto_hospital/app/models/`
- Migraciones automáticas al iniciar

## 📞 Soporte

Si encuentras problemas:
1. Verifica que Python y Node.js estén instalados
2. Ejecuta `INSTALAR_DEPENDENCIAS.bat`
3. Usa `DETENER_SISTEMA.bat` antes de reiniciar
4. Revisa los logs en las ventanas de consola

---

**¡Sistema Hospitalario listo para usar!** 🎉 