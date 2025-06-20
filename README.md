# Sistema Hospitalario de Emergencias 🏥

Sistema completo de gestión hospitalaria desarrollado con tecnologías modernas para el manejo eficiente de pacientes en áreas de emergencia.

## 🚀 Características Principales

- **Gestión de Pacientes**: Registro completo con historia clínica
- **Sistema de Triaje**: Clasificación por colores según urgencia (Rojo, Naranja, Amarillo, Verde, Azul)
- **Lista de Espera en Tiempo Real**: Visualización y gestión de pacientes en espera
- **Gestión de Episodios Médicos**: Control completo del flujo de atención
- **Sistema Multi-Tenant**: Soporte para múltiples hospitales
- **Autenticación JWT**: Sistema seguro de autenticación y autorización
- **Dashboard Estadístico**: Visualización de métricas en tiempo real

## 🛠️ Tecnologías Utilizadas

### Backend
- **FastAPI** (Python 3.13+) - Framework web moderno y rápido
- **SQLAlchemy** - ORM para manejo de base de datos
- **SQLite** - Base de datos (fácilmente migrable a PostgreSQL/MySQL)
- **JWT** - Autenticación segura
- **Pydantic** - Validación de datos

### Frontend
- **Next.js 15** - Framework React con SSR
- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS utility-first
- **Radix UI** - Componentes accesibles

## 📋 Requisitos Previos

- Python 3.13 o superior
- Node.js 18 o superior
- Git

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/louaihallak2000/sistemahospitalario.git
cd sistemahospitalario
```

### 2. Configurar el Backend
```bash
cd proyecto_hospital
python -m venv venv
venv\Scripts\activate  # En Windows
pip install -r requirements.txt
python init_db.py  # Inicializar base de datos con datos de prueba
```

### 3. Configurar el Frontend
```bash
cd frontend
npm install
```

### 4. Ejecutar el Sistema

#### Opción 1: Script Automático (Recomendado)
```bash
# Desde el directorio raíz
INICIAR_SISTEMA_COMPLETO.bat
```

#### Opción 2: Manual
```bash
# Terminal 1 - Backend
cd proyecto_hospital
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Terminal 2 - Frontend
cd proyecto_hospital/frontend
npm run dev
```

## 🔐 Credenciales de Acceso

- **Usuario**: admin
- **Contraseña**: admin123
- **Hospital**: HOSP001

## 📁 Estructura del Proyecto

```
sistema-hospitalario/
├── proyecto_hospital/         # Backend FastAPI
│   ├── app/
│   │   ├── api/              # Endpoints API
│   │   ├── core/             # Configuración core
│   │   ├── models/           # Modelos SQLAlchemy
│   │   ├── schemas/          # Esquemas Pydantic
│   │   └── services/         # Lógica de negocio
│   ├── frontend/             # Frontend Next.js
│   │   ├── app/              # App directory (Next.js 13+)
│   │   ├── components/       # Componentes React
│   │   ├── lib/              # Utilidades y contexto
│   │   └── public/           # Assets estáticos
│   └── init_db.py            # Script inicialización DB
├── .gitignore
├── README.md
├── setup-git.bat             # Configurar Git
└── update-github.bat         # Actualizar repositorio
```

## 🚀 Uso del Sistema

1. **Login**: Acceder con las credenciales proporcionadas
2. **Dashboard**: Vista general con estadísticas en tiempo real
3. **Registro de Pacientes**: Crear nuevos pacientes y episodios
4. **Gestión de Episodios**: 
   - Ver lista de espera
   - Tomar pacientes
   - Registrar evoluciones médicas
   - Prescribir medicamentos
   - Ordenar estudios
   - Dar de alta o internar

## 📊 Funcionalidades Implementadas

- ✅ Autenticación y autorización JWT
- ✅ CRUD completo de pacientes
- ✅ Sistema de triaje por colores
- ✅ Lista de espera en tiempo real
- ✅ Gestión de episodios médicos
- ✅ Prescripciones médicas
- ✅ Órdenes de estudios/laboratorio
- ✅ Evoluciones médicas
- ✅ Alta e internación
- ✅ Dashboard con estadísticas
- ✅ Sistema multi-tenant

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de característica (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 👤 Autor

**Louai Hallak**
- GitHub: [@louaihallak2000](https://github.com/louaihallak2000)

---
⭐ Si este proyecto te fue útil, considera darle una estrella! 