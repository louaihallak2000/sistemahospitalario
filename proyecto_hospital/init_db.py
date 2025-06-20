"""
Script para inicializar la base de datos con datos de ejemplo
Ejecutar con: python init_db.py
"""

import os
import sys
from datetime import datetime, date
import uuid

# Agregar el directorio app al path para importar los módulos
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.hospital import Hospital
from app.models.usuario import Usuario
from app.models.paciente import Paciente, PacienteHospital
from app.models.episodio import Episodio
from app.core.security import get_password_hash
from app.core.database import Base

# Configuración de base de datos - Cambiado a SQLite
DATABASE_URL = "sqlite:///./hospital_db.sqlite"

def init_database():
    """Inicializa la base de datos con datos de ejemplo"""
    
    # Crear engine y sesión
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("Inicializando base de datos con datos de ejemplo...")
        
        # Crear hospitales de ejemplo
        hospitales = [
            Hospital(
                id="HOSP001",
                nombre="Hospital Central San Juan",
                nombre_corto="HC San Juan",
                direccion="Av. Principal 123, Ciudad",
                telefono="+54-11-1234-5678",
                email="info@hcsanjuan.com",
                tipo="publico",
                activo=True,
                configuracion={"zona_horaria": "America/Argentina/Buenos_Aires"}
            ),
            Hospital(
                id="HOSP002", 
                nombre="Clínica Privada Santa María",
                nombre_corto="Clínica Santa María",
                direccion="Calle Secundaria 456, Ciudad",
                telefono="+54-11-8765-4321",
                email="contacto@clinicasantamaria.com",
                tipo="privado",
                activo=True,
                configuracion={"zona_horaria": "America/Argentina/Buenos_Aires"}
            )
        ]
        
        for hospital in hospitales:
            existing = db.query(Hospital).filter(Hospital.id == hospital.id).first()
            if not existing:
                db.add(hospital)
        
        # Crear usuarios de ejemplo
        usuarios = [
            Usuario(
                username="admin",
                password_hash=get_password_hash("admin123"),
                hospital_id="HOSP001",
                nombre="Administrador",
                apellido="Sistema",
                email="admin@hcsanjuan.com",
                rol="administrador",
                activo=True
            ),
            Usuario(
                username="medico1",
                password_hash=get_password_hash("medico123"),
                hospital_id="HOSP001",
                nombre="Dr. Carlos",
                apellido="García",
                email="cgarcia@hcsanjuan.com",
                rol="medico",
                especialidad="Cardiología",
                matricula_profesional="MP12345",
                activo=True
            ),
            Usuario(
                username="enfermera1",
                password_hash=get_password_hash("enfermera123"),
                hospital_id="HOSP001",
                nombre="Lic. María",
                apellido="Rodríguez",
                email="mrodriguez@hcsanjuan.com",
                rol="enfermera",
                activo=True
            ),
            Usuario(
                username="admin2",
                password_hash=get_password_hash("admin456"),
                hospital_id="HOSP002",
                nombre="Administrador",
                apellido="Clínica",
                email="admin@clinicasantamaria.com",
                rol="administrador",
                activo=True
            )
        ]
        
        for usuario in usuarios:
            existing = db.query(Usuario).filter(
                Usuario.username == usuario.username,
                Usuario.hospital_id == usuario.hospital_id
            ).first()
            if not existing:
                db.add(usuario)
        
        # Crear pacientes de ejemplo
        pacientes = [
            Paciente(
                dni="12345678",
                nombre_completo="Juan Carlos Pérez",
                fecha_nacimiento=date(1980, 3, 15),
                sexo="M",
                tipo_sangre="O+",
                alergias_conocidas="Ninguna conocida"
            ),
            Paciente(
                dni="87654321",
                nombre_completo="María Elena García",
                fecha_nacimiento=date(1975, 8, 22),
                sexo="F",
                tipo_sangre="A-",
                alergias_conocidas="Penicilina"
            ),
            Paciente(
                dni="11223344",
                nombre_completo="Roberto Luis Martínez",
                fecha_nacimiento=date(1990, 12, 5),
                sexo="M",
                tipo_sangre="B+",
                alergias_conocidas="Ninguna conocida"
            )
        ]
        
        for paciente in pacientes:
            existing = db.query(Paciente).filter(Paciente.dni == paciente.dni).first()
            if not existing:
                db.add(paciente)
                db.flush()  # Para obtener el ID
                
                # Crear relaciones con hospitales
                for hospital_id in ["HOSP001", "HOSP002"]:
                    paciente_hospital = PacienteHospital(
                        paciente_id=paciente.id,
                        hospital_id=hospital_id,
                        numero_historia_local=f"HCL{paciente.dni[-4:]}",
                        telefono="+54-11-9999-0000",
                        direccion="Dirección del paciente",
                        contacto_emergencia="Familiar - Tel: +54-11-8888-0000",
                        obra_social="OSDE" if hospital_id == "HOSP002" else "PAMI",
                        numero_afiliado=f"AF{paciente.dni}",
                        fecha_primera_atencion=datetime.utcnow()
                    )
                    db.add(paciente_hospital)
        
        # Crear algunos episodios de ejemplo
        db.flush()  # Para asegurar que los pacientes están creados
        
        # Obtener los pacientes creados
        pacientes_creados = db.query(Paciente).all()
        
        episodios = [
            Episodio(
                paciente_id=pacientes_creados[0].id,
                hospital_id="HOSP001",
                numero_episodio_local="EP001",
                tipo="consulta",
                estado="activo",
                medico_responsable="Dr. Carlos García",
                diagnostico_principal="Control rutinario",
                resumen_clinico="Paciente presenta buen estado general",
                datos_json={
                    "motivo_consulta": "Control rutinario de presión arterial",
                    "color_triaje": "VERDE",
                    "fecha_triaje": datetime.utcnow().isoformat()
                }
            ),
            Episodio(
                paciente_id=pacientes_creados[1].id,
                hospital_id="HOSP001",
                numero_episodio_local="EP002",
                tipo="emergencia",
                estado="activo",
                medico_responsable="Dr. Carlos García",
                diagnostico_principal="Dolor torácico",
                resumen_clinico="Paciente con dolor precordial",
                datos_json={
                    "motivo_consulta": "Dolor en el pecho con dificultad para respirar",
                    "color_triaje": "ROJO",
                    "fecha_triaje": datetime.utcnow().isoformat()
                }
            ),
            Episodio(
                paciente_id=pacientes_creados[2].id,
                hospital_id="HOSP001",
                numero_episodio_local="EP003",
                tipo="consulta",
                estado="activo",
                medico_responsable="Dr. Carlos García",
                diagnostico_principal="Cefalea",
                resumen_clinico="Dolor de cabeza intenso",
                datos_json={
                    "motivo_consulta": "Dolor de cabeza persistente hace 3 días",
                    "color_triaje": "AMARILLO",
                    "fecha_triaje": datetime.utcnow().isoformat()
                }
            ),
            Episodio(
                paciente_id=pacientes_creados[0].id,
                hospital_id="HOSP002",
                numero_episodio_local="EP004",
                tipo="consulta",
                estado="activo",
                medico_responsable="Dr. Ana López",
                diagnostico_principal="Consulta dermatológica",
                resumen_clinico="Revisión de lunar",
                datos_json={
                    "motivo_consulta": "Revisión de lunar en brazo derecho",
                    "color_triaje": "AZUL",
                    "fecha_triaje": datetime.utcnow().isoformat()
                }
            ),
            Episodio(
                paciente_id=pacientes_creados[1].id,
                hospital_id="HOSP002",
                numero_episodio_local="EP005",
                tipo="urgencia",
                estado="activo",
                medico_responsable="Dr. Ana López",
                diagnostico_principal="Fractura en muñeca",
                resumen_clinico="Probable fractura tras caída",
                datos_json={
                    "motivo_consulta": "Caída con dolor intenso en muñeca izquierda",
                    "color_triaje": "NARANJA",
                    "fecha_triaje": datetime.utcnow().isoformat()
                }
            )
        ]
        
        for episodio in episodios:
            db.add(episodio)
        
        db.commit()
        print("✅ Base de datos inicializada correctamente!")
        print("\n📋 Datos de ejemplo creados:")
        print("   🏥 Hospitales: HOSP001, HOSP002")
        print("   👤 Usuarios de prueba:")
        print("      - admin/admin123 (HOSP001)")
        print("      - medico1/medico123 (HOSP001)")
        print("      - enfermera1/enfermera123 (HOSP001)")
        print("      - admin2/admin456 (HOSP002)")
        print("   🧑‍⚕️ Pacientes: 3 pacientes registrados en ambos hospitales")
        print("   📊 Episodios: 5 episodios de ejemplo creados con diferentes triajes")
        print("      - ROJO: 1 episodio (emergencia)")
        print("      - NARANJA: 1 episodio (urgencia)")  
        print("      - AMARILLO: 1 episodio (menos urgente)")
        print("      - VERDE: 1 episodio (no urgente)")
        print("      - AZUL: 1 episodio (consulta)")
        print("\n🚀 Sistema listo para usar!")
        print("   Frontend: http://localhost:3000")
        print("   Backend: http://127.0.0.1:8000")
        print("   Docs: http://127.0.0.1:8000/docs")
        
    except Exception as e:
        print(f"❌ Error al inicializar la base de datos: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database() 