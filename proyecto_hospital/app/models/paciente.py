from sqlalchemy import Column, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from datetime import datetime

class Paciente(Base):
    __tablename__ = "pacientes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dni = Column(String(20), unique=True, nullable=False, index=True)
    nombre_completo = Column(String(255), nullable=False)
    fecha_nacimiento = Column(Date)
    sexo = Column(String(1))
    tipo_sangre = Column(String(5))
    alergias_conocidas = Column(Text)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_ultima_actualizacion = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    episodios = relationship("Episodio", back_populates="paciente")

class PacienteHospital(Base):
    __tablename__ = "pacientes_hospital"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    paciente_id = Column(String(36), ForeignKey("pacientes.id"), nullable=False)
    hospital_id = Column(String(10), ForeignKey("hospitales.id"), nullable=False)
    numero_historia_local = Column(String(20))
    telefono = Column(String(20))
    direccion = Column(Text)
    contacto_emergencia = Column(String(255))
    obra_social = Column(String(100))
    numero_afiliado = Column(String(50))
    fecha_primera_atencion = Column(DateTime)
    fecha_ultima_atencion = Column(DateTime)
    notas_administrativas = Column(Text)
    
    paciente = relationship("Paciente")
    hospital = relationship("Hospital") 