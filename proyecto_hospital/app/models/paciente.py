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
    fecha_ultima_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    episodios = relationship("Episodio", back_populates="paciente", cascade="all, delete-orphan")
    hospitales = relationship("PacienteHospital", back_populates="paciente", cascade="all, delete-orphan")

class PacienteHospital(Base):
    __tablename__ = "pacientes_hospital"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    paciente_id = Column(String(36), ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False)
    hospital_id = Column(String(10), ForeignKey("hospitales.id", ondelete="CASCADE"), nullable=False)
    numero_historia_local = Column(String(20))
    telefono = Column(String(20))
    direccion = Column(Text)
    contacto_emergencia = Column(String(255))
    obra_social = Column(String(100))
    numero_afiliado = Column(String(50))
    fecha_primera_atencion = Column(DateTime)
    fecha_ultima_atencion = Column(DateTime)
    notas_administrativas = Column(Text)
    
    # 🏥 NUEVOS CAMPOS PARA ADMISIÓN (nullable=True para compatibilidad)
    documento_tipo = Column(String(30), nullable=True)  # DNI, Pasaporte, etc.
    contacto_emergencia_nombre = Column(String(100), nullable=True)
    contacto_emergencia_telefono = Column(String(30), nullable=True)
    contacto_emergencia_parentesco = Column(String(50), nullable=True)  # Padre, Madre, Cónyuge, etc.
    
    paciente = relationship("Paciente", back_populates="hospitales")
    hospital = relationship("Hospital", back_populates="pacientes_hospital") 