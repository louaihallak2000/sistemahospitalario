from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Hospital(Base):
    __tablename__ = "hospitales"
    
    id = Column(String(10), primary_key=True)
    nombre = Column(String(255), nullable=False)
    nombre_corto = Column(String(50))
    direccion = Column(Text)
    telefono = Column(String(20))
    email = Column(String(100))
    tipo = Column(String(20))
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    configuracion = Column(JSON)
    
    # Relaciones
    usuarios = relationship("Usuario", back_populates="hospital", cascade="all, delete-orphan")
    episodios = relationship("Episodio", back_populates="hospital", cascade="all, delete-orphan")
    pacientes_hospital = relationship("PacienteHospital", back_populates="hospital", cascade="all, delete-orphan") 