import asyncio
import random
from datetime import datetime, timedelta
from app.core.database import SessionLocal, engine, Base
from app.models.hospital import Hospital
from app.models.usuario import Usuario
from app.models.paciente import Paciente
from app.models.episodio import Episodio
from app.models.historia_clinica import RegistroHistoriaClinica, TipoRegistro
# Simplificado para evitar problemas de importación
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def crear_datos_ejemplo():
    """Crear datos de ejemplo para el sistema hospitalario"""
    
    # Crear tablas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Verificar si ya existen datos (comentado para forzar recreación)
        # if db.query(Hospital).count() > 0:
        #     logger.info("Los datos de ejemplo ya existen")
        #     return
        
        logger.info("🏥 Creando datos de ejemplo...")
        
        # 1. Crear Hospital (verificar si ya existe)
        hospital_existente = db.query(Hospital).filter(Hospital.id == "HG001").first()
        if not hospital_existente:
            hospital = Hospital(
                id="HG001",
                nombre="Hospital General San Juan",
                nombre_corto="Hospital San Juan", 
                direccion="Av. Libertador 1234",
                telefono="011-4567-8900",
                email="contacto@hospitalsanjuan.com",
                tipo="Público"
            )
            db.add(hospital)
            db.commit()
        else:
            hospital = hospital_existente
        
        # 2. Crear Usuarios
        usuarios = [
            Usuario(
                username="dr.martinez",
                password_hash="$2b$12$ejemplo_hash_medico",
                hospital_id="HG001",
                rol="medico",
                nombre="Carlos",
                apellido="Martínez",
                email="carlos.martinez@hospital.com",
                especialidad="Medicina Interna"
            ),
            Usuario(
                username="enf.garcia",
                password_hash="$2b$12$ejemplo_hash_enfermera",
                hospital_id="HG001",
                rol="enfermera",
                nombre="Ana",
                apellido="García",
                email="ana.garcia@hospital.com",
                especialidad="Enfermería de Emergencia"
            ),
            Usuario(
                username="enf.lopez",
                password_hash="$2b$12$ejemplo_hash_enfermera2",
                hospital_id="HG001",
                rol="enfermera",
                nombre="María",
                apellido="López",
                email="maria.lopez@hospital.com",
                especialidad="Enfermería General"
            )
        ]
        
        for usuario in usuarios:
            db.add(usuario)
        db.commit()
        db.refresh(usuarios[0])  # Para obtener los IDs generados
        
        # 3. Crear Pacientes
        nombres = ["Juan", "María", "Carlos", "Ana", "Pedro", "Laura", "Diego", "Sofia", "Miguel", "Elena"]
        apellidos = ["González", "Rodríguez", "López", "Martínez", "García", "Fernández", "Pérez", "Sánchez", "Romero", "Torres"]
        
        pacientes = []
        for i in range(15):  # Crear 15 pacientes
            nombre = random.choice(nombres)
            apellido = random.choice(apellidos)
            
            # Generar fecha de nacimiento aleatoria (18-80 años)
            edad = random.randint(18, 80)
            fecha_nacimiento = datetime.now() - timedelta(days=edad*365 + random.randint(0, 365))
            
            paciente = Paciente(
                nombre_completo=f"{nombre} {apellido}",
                dni=f"{20000000 + i + random.randint(1000, 9999)}",
                fecha_nacimiento=fecha_nacimiento.date(),
                sexo=random.choice(["M", "F"]),
                tipo_sangre=random.choice(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
            )
            pacientes.append(paciente)
            db.add(paciente)
        
        db.commit()
        
        # Refrescar para obtener los IDs
        for paciente in pacientes:
            db.refresh(paciente)
        
        # 4. Crear Episodios
        colores_triaje = ["ROJO", "NARANJA", "AMARILLO", "VERDE", "AZUL"]
        motivos_consulta = [
            "Dolor torácico", "Dificultad respiratoria", "Dolor abdominal", 
            "Cefalea", "Fiebre", "Traumatismo", "Mareos", "Vómitos",
            "Dolor de espalda", "Consulta de rutina", "Control post-operatorio"
        ]
        
        estados_episodio = ["waiting", "in-progress", "awaiting-triage"]
        
        episodios = []
        for i in range(20):  # Crear 20 episodios
            paciente = random.choice(pacientes)
            
            # Algunos episodios sin triaje (para lista de espera de triaje)
            if i < 5:
                color_triaje = None
                estado = "awaiting-triage"
            else:
                color_triaje = random.choice(colores_triaje)
                estado = random.choice(["waiting", "in-progress"])
            
            episodio = Episodio(
                paciente_id=paciente.id,
                hospital_id="HG001",
                tipo="emergencia",
                motivo_consulta=random.choice(motivos_consulta),
                fecha_inicio=datetime.now() - timedelta(hours=random.randint(1, 48)),
                estado=estado,
                color_triaje=color_triaje,
                medico_responsable=f"{usuarios[0].nombre} {usuarios[0].apellido}" if estado == "in-progress" else None,
                resumen_clinico=f"Paciente presenta {random.choice(motivos_consulta).lower()}. Evaluación inicial completada."
            )
            episodios.append(episodio)
            db.add(episodio)
        
        db.commit()
        
        # 5. Crear algunos registros de historia clínica
        logger.info("📋 Creando registros de historia clínica de ejemplo...")
        
        for i, episodio in enumerate(episodios[:10]):  # Solo para los primeros 10 episodios
            # Registro de triaje
            if episodio.color_triaje:
                registro_triaje = RegistroHistoriaClinica(
                    paciente_id=episodio.paciente_id,
                    episodio_id=episodio.id,
                    tipo_registro=TipoRegistro.TRIAJE_ASIGNADO,
                    titulo=f"Triaje asignado: {episodio.color_triaje}",
                    contenido={
                        "tipo": "triaje",
                        "clasificacion": {
                            "color": episodio.color_triaje,
                            "motivo_consulta": episodio.motivo_consulta,
                            "observaciones": episodio.resumen_clinico
                        },
                        "evaluacion": {
                            "enfermera_triaje": "Enfermera Ana García",
                            "timestamp": episodio.fecha_inicio.isoformat()
                        }
                    },
                    usuario_id=usuarios[1].id,
                    usuario_nombre=f"{usuarios[1].nombre} {usuarios[1].apellido}",
                    timestamp=episodio.fecha_inicio + timedelta(minutes=10),
                    area="emergencia"
                )
                db.add(registro_triaje)
            
            # Registro de signos vitales
            if random.choice([True, False]):  # 50% de probabilidad
                registro_signos = RegistroHistoriaClinica(
                    paciente_id=episodio.paciente_id,
                    episodio_id=episodio.id,
                    tipo_registro=TipoRegistro.SIGNO_VITAL,
                    titulo="Signos vitales registrados",
                    contenido={
                        "tipo": "signos_vitales",
                        "valores": {
                            "presion_arterial_sistolica": random.randint(110, 140),
                            "presion_arterial_diastolica": random.randint(70, 90),
                            "frecuencia_cardiaca": random.randint(60, 100),
                            "frecuencia_respiratoria": random.randint(12, 20),
                            "temperatura": round(random.uniform(36.0, 37.5), 1),
                            "saturacion_oxigeno": random.randint(95, 100)
                        },
                        "observaciones": "Signos vitales dentro de parámetros normales"
                    },
                    usuario_id=random.choice([usuarios[1].id, usuarios[2].id]),
                    usuario_nombre=random.choice([f"{usuarios[1].nombre} {usuarios[1].apellido}", f"{usuarios[2].nombre} {usuarios[2].apellido}"]),
                    timestamp=episodio.fecha_inicio + timedelta(minutes=random.randint(30, 120)),
                    area="emergencia"
                )
                db.add(registro_signos)
        
        db.commit()
        
        logger.info("✅ Datos de ejemplo creados exitosamente!")
        logger.info(f"  - {len(usuarios)} usuarios creados")
        logger.info(f"  - {len(pacientes)} pacientes creados")
        logger.info(f"  - {len(episodios)} episodios creados")
        
        # Mostrar resumen de episodios por estado
        episodios_triaje = len([e for e in episodios if e.estado == "awaiting-triage"])
        episodios_espera = len([e for e in episodios if e.estado == "waiting"])
        episodios_proceso = len([e for e in episodios if e.estado == "in-progress"])
        
        logger.info(f"  - {episodios_triaje} episodios pendientes de triaje")
        logger.info(f"  - {episodios_espera} episodios en lista de espera")
        logger.info(f"  - {episodios_proceso} episodios en proceso")
        
    except Exception as e:
        logger.error(f"Error creando datos de ejemplo: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    crear_datos_ejemplo() 