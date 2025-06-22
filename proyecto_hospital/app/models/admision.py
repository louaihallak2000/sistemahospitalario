from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from datetime import datetime

class RegistroAdmision(Base):
    __tablename__ = "registros_admision"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    paciente_id = Column(String(36), ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False)
    episodio_id = Column(String(36), ForeignKey("episodios.id", ondelete="CASCADE"), nullable=False)
    hospital_id = Column(String(10), ForeignKey("hospitales.id", ondelete="CASCADE"), nullable=False)
    
    # Datos de admisión
    fecha_admision = Column(DateTime, nullable=False, default=datetime.utcnow)
    tipo_admision = Column(String(50), nullable=False)  # 'Guardia', 'Programada', 'Derivacion', 'Emergencia'
    motivo_consulta = Column(Text, nullable=False)
    estado_admision = Column(String(30), default='activa')  # 'activa', 'completada', 'cancelada'
    
    # Información adicional
    acompanante_nombre = Column(String(100))
    acompanante_telefono = Column(String(30))
    acompanante_parentesco = Column(String(50))
    observaciones_admision = Column(Text)
    
    # Personal responsable
    usuario_admision = Column(String(100))  # Usuario que realizó la admisión
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    paciente = relationship("Paciente")
    episodio = relationship("Episodio")
    hospital = relationship("Hospital") 