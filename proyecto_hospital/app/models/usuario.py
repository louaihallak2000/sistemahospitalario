from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    hospital_id = Column(String(10), ForeignKey("hospitales.id"), nullable=False)
    nombre = Column(String(255), nullable=False)
    apellido = Column(String(255), nullable=False)
    email = Column(String(255))
    rol = Column(String(20), nullable=False)
    especialidad = Column(String(100))
    matricula_profesional = Column(String(50))
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    ultimo_acceso = Column(DateTime)
    configuracion_personal = Column(JSON)
    
    hospital = relationship("Hospital") 