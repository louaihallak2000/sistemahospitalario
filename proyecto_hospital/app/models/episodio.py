from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from datetime import datetime

class Episodio(Base):
    __tablename__ = "episodios"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    paciente_id = Column(String(36), ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False)
    hospital_id = Column(String(10), ForeignKey("hospitales.id", ondelete="CASCADE"), nullable=False)
    numero_episodio_local = Column(String(20))
    fecha_inicio = Column(DateTime, nullable=False, default=datetime.utcnow)
    fecha_cierre = Column(DateTime)
    tipo = Column(String(20), nullable=False)
    estado = Column(String(20), default='activo')
    medico_responsable = Column(String(255))
    diagnostico_principal = Column(Text)
    resumen_clinico = Column(Text)
    
    # 🔧 REFACTORIZACIÓN: Nuevas columnas explícitas
    color_triaje = Column(String(20))  # ROJO, NARANJA, AMARILLO, VERDE, AZUL
    motivo_consulta = Column(Text)     # Motivo de consulta del paciente
    
    # Campo JSON para datos adicionales (prescripciones, estudios, etc.)
    datos_json = Column(JSON)
    
    # Relaciones - usando strings para evitar imports circulares
    paciente = relationship("Paciente", back_populates="episodios")
    hospital = relationship("Hospital", back_populates="episodios") 