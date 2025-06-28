# 🏥 GUÍA RÁPIDA - SISTEMA HOSPITALARIO NUEVO WORKFLOW

## ⚡ **INICIO RÁPIDO (30 SEGUNDOS)**

### **🚀 Opción 1: Automático (RECOMENDADO)**
```bash
INICIAR_NUEVO_WORKFLOW.bat
```

### **🎯 Opción 2: Completo con verificaciones**
```bash
SISTEMA_COMPLETO_FUNCIONANDO.bat
```

### **🌐 Opción 3: Solo frontend actualizado**
```bash
INICIAR_FRONTEND_NUEVO_WORKFLOW.bat
```

---

## 🌐 **URLS DEL SISTEMA**

- **🌐 Frontend**: http://localhost:3000
- **🔧 Backend**: http://127.0.0.1:8000  
- **📖 API Docs**: http://127.0.0.1:8000/docs
- **🔍 Admin**: http://127.0.0.1:8000/admin (si disponible)

---

## 🔐 **CREDENCIALES DE ACCESO**

### **🏥 Hospital de Prueba**
- **Hospital ID**: `HOSP001`
- **Nombre**: Hospital General

### **👤 Usuarios**
| Rol | Usuario | Contraseña | Permisos |
|-----|---------|------------|----------|
| 👨‍💼 Admin | `admin` | `admin123` | Acceso completo |
| 👨‍⚕️ Médico | `medico1` | `medico123` | Lista médica, atención, shockroom |
| 👩‍⚕️ Enfermera | `enfermera1` | `enfermera123` | Triaje, decisiones, shockroom |

---

## 🧭 **NAVEGACIÓN DEL NUEVO WORKFLOW**

### **📋 Rutas Principales**
| Ruta | Descripción | Rol |
|------|-------------|-----|
| `/` | Dashboard principal | Todos |
| `/codigos-emergencia` | Gestión códigos emergencia | Todos |
| `/admision` | Admisión pacientes | Admin, Enfermera |
| `/enfermeria/triaje` | Triaje por enfermería | Admin, Enfermera |
| `/enfermeria/decisiones` | Decisiones post-triaje | Admin, Enfermera |
| `/medicos/lista` | Lista médica priorizada | Admin, Médico |
| `/medicos/atencion/:id` | Atención médica completa | Admin, Médico |
| `/shockroom` | Shockroom con 6 camas | Todos |
| `/pacientes/:id` | Ficha del paciente | Todos |

---

## 🎯 **WORKFLOW COMPLETO IMPLEMENTADO**

### **🚨 PROCESO A: CÓDIGOS DE EMERGENCIA**

#### **7 Tipos de Códigos Disponibles:**
1. **🔵 AZUL** - Paro cardiorrespiratorio (RCP inmediato)
2. **🧠 ACV** - Accidente cerebrovascular (protocolo stroke)  
3. **❤️ IAM** - Infarto agudo de miocardio (protocolo cardíaco)
4. **🤕 TRAUMA** - Trauma mayor/politraumatismo
5. **🦠 SEPSIS** - Sepsis severa (protocolo antibiótico)
6. **👶 PEDIÁTRICO** - Emergencia pediátrica
7. **🤰 OBSTÉTRICO** - Emergencia obstétrica

#### **Flujo de Códigos:**
1. **Personal activa código** → Notificación automática
2. **Todo el personal** responde inmediatamente  
3. **Se crea episodio** de emergencia automático
4. **Se registra** respuesta del personal
5. **Se cierra código** con resultado final

### **📋 PROCESO B: FLUJO NORMAL**

```
Paciente llega
    ↓
Admisión automática → Lista triaje
    ↓
Enfermería toma paciente → Asigna triaje (colores + signos vitales)
    ↓
Enfermería decide: Lista médica | Alta enfermería | Shockroom
    ↓
Médico toma paciente → Atención completa
    ↓
Prescripciones + Procedimientos + Estudios + Evoluciones
    ↓
Decisión final OBLIGATORIA: Alta | Internación | Continúa
```

### **🚑 PROCESO C: TRASLADOS EXTERNOS**

1. **Admisión rápida** desde hospital externo
2. **Evaluación inmediata** por enfermería/médico
3. **Decisión**: Shockroom | Lista médica | Código emergencia
4. **Integración automática** si hospital origen usa mismo sistema

---

## 👥 **ROLES Y PERMISOS ESPECÍFICOS**

### **👨‍💼 ADMINISTRADOR**
- ✅ Acceso completo a todo el sistema
- ✅ Gestión de usuarios y hospitales
- ✅ Configuración de parámetros
- ✅ Reportes y estadísticas avanzadas
- ✅ Códigos de emergencia
- ✅ Todas las funciones de médicos y enfermeras

### **👨‍⚕️ MÉDICO**
- ✅ Lista médica priorizada por triaje
- ✅ Tomar pacientes de la lista  
- ✅ Atención médica completa
- ✅ Prescripciones de medicamentos
- ✅ Indicación de procedimientos
- ✅ Órdenes de estudios/laboratorio
- ✅ Evoluciones médicas
- ✅ Decisión final obligatoria
- ✅ Acceso al shockroom
- ✅ Activar/responder códigos de emergencia

### **👩‍⚕️ ENFERMERA**
- ✅ Realizar triaje con 5 colores
- ✅ Registro de signos vitales
- ✅ Decisiones post-triaje
- ✅ Enviar a lista médica
- ✅ Alta de enfermería directa
- ✅ Enviar a shockroom
- ✅ Acceso al shockroom
- ✅ Indicaciones de monitoreo
- ✅ Activar/responder códigos de emergencia

---

## 🎨 **COLORES DE TRIAJE**

| Color | Prioridad | Tiempo Objetivo | Descripción |
|-------|-----------|-----------------|-------------|
| 🔴 **ROJO** | 1 | Inmediato | Emergencia - Resucitación inmediata |
| 🟠 **NARANJA** | 2 | 10 minutos | Urgencia - Atención prioritaria |
| 🟡 **AMARILLO** | 3 | 60 minutos | Urgencia menor - Puede esperar |
| 🟢 **VERDE** | 4 | 120 minutos | No urgente - Atención programada |
| 🔵 **AZUL** | 5 | 240 minutos | No urgente - Puede demorar |

---

## 🚑 **SHOCKROOM AVANZADO**

### **6 Camas Disponibles:**
- **Cama 1-6**: Monitoreo individual
- **Estado**: Libre/Ocupada/Mantenimiento
- **Asignación**: Manual por personal autorizado

### **3 Vías de Admisión:**
1. **Enfermería** → Desde decisión post-triaje
2. **Médico** → Desde lista médica o evaluación
3. **Traslado Externo** → Admisión directa

### **Panel por Rol:**
- **Médicos**: Control completo, prescripciones, decisiones
- **Enfermeras**: Monitoreo, indicaciones, signos vitales
- **Admin**: Vista general, estadísticas, configuración

---

## ⚙️ **COMANDOS ÚTILES**

### **🚀 Iniciar Sistema**
```bash
# Nuevo workflow (recomendado)
INICIAR_NUEVO_WORKFLOW.bat

# Sistema completo con verificaciones  
SISTEMA_COMPLETO_FUNCIONANDO.bat

# Solo frontend actualizado
INICIAR_FRONTEND_NUEVO_WORKFLOW.bat
```

### **🛑 Detener Sistema**
```bash
# Método principal
DETENER_SISTEMA_HOSPITALARIO_COMPLETO.bat

# PowerShell avanzado
DETENER_SISTEMA.ps1

# Manual
Ctrl+C en cada terminal
```

### **📦 Instalación/Actualización**
```bash
# Instalar todas las dependencias
INSTALAR_DEPENDENCIAS.bat

# Actualizar base de datos
cd proyecto_hospital
python actualizar_db_workflow.py
```

---

## 🔧 **SOLUCIÓN DE PROBLEMAS COMUNES**

### **❌ Error: Puerto ocupado**
```bash
# Detener sistema completamente
DETENER_SISTEMA_HOSPITALARIO_COMPLETO.bat

# O forzar detención manual
taskkill /f /im python.exe
taskkill /f /im node.exe
```

### **❌ Error: Dependencias faltantes**
```bash
# Reinstalar dependencias
INSTALAR_DEPENDENCIAS.bat

# O manual:
cd proyecto_hospital
pip install -r requirements.txt
cd frontend
npm install
```

### **❌ Error: Base de datos**
```bash
cd proyecto_hospital
python actualizar_db_workflow.py
# O si falla:
python init_db.py
```

### **❌ Frontend no carga**
```bash
cd proyecto_hospital/frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 **CARACTERÍSTICAS TÉCNICAS**

### **🔧 Backend**
- **FastAPI** - API RESTful moderna
- **SQLAlchemy** - ORM con modelos actualizados  
- **SQLite** - Base de datos (migrable a PostgreSQL)
- **JWT Multi-tenant** - Autenticación por hospital
- **WebSocket** - Notificaciones en tiempo real
- **Pydantic V2** - Validación de datos

### **🌐 Frontend**
- **Next.js 15** - Framework React SSR/SSG
- **React 19** - UI moderna y reactiva
- **TypeScript** - Tipado fuerte
- **Tailwind CSS** - Styling utility-first
- **Radix UI** - Componentes accesibles

---

## 🏆 **FUNCIONALIDADES IMPLEMENTADAS**

### **✅ Sistema Completo**
- 🚨 7 Códigos de emergencia
- 🎨 5 Colores de triaje  
- 👥 3 Roles de usuario diferenciados
- 🚑 Shockroom con 6 camas
- 📊 Dashboard en tiempo real
- 🔄 Workflow completamente automatizado
- 📱 Interfaz responsive
- 🔐 Autenticación JWT multi-tenant
- 📡 Notificaciones en tiempo real
- 📈 Reportes y estadísticas

### **🎯 Estados del Workflow**
- `espera_triaje` - Paciente esperando evaluación
- `en_lista_medica` - En lista de espera médica
- `en_atencion` - Bajo atención médica activa
- `en_shockroom` - En sala de shock
- `alta_enfermeria` - Alta directa por enfermería
- `finalizado` - Episodio terminado

---

## 📞 **SOPORTE Y CONTACTO**

### **🐛 Reportar Problemas**
- Crear issue en GitHub con detalles
- Incluir logs y capturas de pantalla
- Describir pasos para reproducir

### **💡 Solicitar Funcionalidades**
- Crear issue con etiqueta "enhancement"
- Describir la funcionalidad deseada
- Justificar el caso de uso

### **📧 Contacto**
- **Desarrollador**: Louai Hallak
- **GitHub**: [@louaihallak2000](https://github.com/louaihallak2000)

---

**🎉 Sistema 100% funcional con nuevo workflow implementado**

**📈 Última actualización: Workflow hospitalario completo rediseñado** 