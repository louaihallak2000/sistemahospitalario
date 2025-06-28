# Importar todos los modelos para que SQLAlchemy los reconozca
from .hospital import Hospital
from .usuario import Usuario
from .paciente import Paciente
from .episodio import Episodio
from .admision import RegistroAdmision
from .enfermeria import SignosVitales, RegistroEnfermeria
from .historia_clinica import RegistroHistoriaClinica
from .shockroom import ShockroomCama, ShockroomAsignacion, ShockroomAlerta
from .codigo_emergencia import CodigoEmergencia, EpisodioEmergencia

# Hacer disponibles todas las clases
__all__ = [
    "Hospital",
    "Usuario", 
    "Paciente",
    "Episodio",
    "RegistroAdmision",
    "SignosVitales",
    "RegistroEnfermeria",
    "RegistroHistoriaClinica",
    "ShockroomCama",
    "ShockroomAsignacion", 
    "ShockroomAlerta",
    "CodigoEmergencia",
    "EpisodioEmergencia"
] 