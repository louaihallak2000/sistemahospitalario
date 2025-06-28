from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from datetime import datetime

class CodigoEmergencia(Base):
    __tablename__ = "codigos_emergencia"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hospital_id = Column(String(10), ForeignKey("hospitales.id", ondelete="CASCADE"), nullable=False)
    tipo_codigo = Column(String(50), nullable=False)  # AZUL, ACV, IAM, TRAUMA, SEPSIS, PEDIATRICO, OBSTETRICO
    descripcion = Column(String(255), nullable=False)
    ubicacion = Column(String(100))  # Dónde se activó el código
    activado_por = Column(String(255), nullable=False)  # Usuario que activó
    fecha_activacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_cierre = Column(DateTime)
    estado = Column(String(20), default='activo')  # activo, atendido, cerrado
    personal_respondio = Column(JSON)  # Lista de personal que respondió
    notas_evento = Column(Text)  # Notas del evento
    resultado = Column(String(100))  # exitoso, traslado, etc.
    tiempo_respuesta = Column(String(20))  # Tiempo hasta primera respuesta
    
    # Datos del paciente (pueden agregarse después)
    paciente_id = Column(String(36), ForeignKey("pacientes.id", ondelete="SET NULL"), nullable=True)
    datos_paciente_temporales = Column(JSON)  # Si no se conoce el paciente inicialmente
    
    # Relaciones
    hospital = relationship("Hospital")
    paciente = relationship("Paciente")

class EpisodioEmergencia(Base):
    """Episodio especial generado por códigos de emergencia"""
    __tablename__ = "episodios_emergencia"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    codigo_emergencia_id = Column(String(36), ForeignKey("codigos_emergencia.id", ondelete="CASCADE"), nullable=False)
    paciente_id = Column(String(36), ForeignKey("pacientes.id", ondelete="SET NULL"), nullable=True)
    hospital_id = Column(String(10), ForeignKey("hospitales.id", ondelete="CASCADE"), nullable=False)
    
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    fecha_cierre = Column(DateTime)
    estado = Column(String(30), default='codigo_activo')  # codigo_activo, en_atencion, cerrado
    
    # Evoluciones médicas del código
    evoluciones_medicas = Column(JSON)
    evoluciones_enfermeria = Column(JSON)
    procedimientos = Column(JSON)
    medicacion = Column(JSON)
    
    # Resultado final
    resultado_final = Column(String(100))  # alta, internacion, derivacion, fallecimiento
    resumen_codigo = Column(Text)
    
    # Relaciones
    codigo_emergencia = relationship("CodigoEmergencia")
    paciente = relationship("Paciente")
    hospital = relationship("Hospital") 