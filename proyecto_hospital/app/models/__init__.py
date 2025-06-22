# Importaciones de todos los modelos para que estén disponibles para Alembic
from .paciente import Paciente, PacienteHospital
from .episodio import Episodio
from .hospital import Hospital
from .usuario import Usuario
from .admision import RegistroAdmision
from .enfermeria import SignosVitales, RegistroEnfermeria

__all__ = [
    "Paciente",
    "PacienteHospital", 
    "Episodio",
    "Hospital",
    "Usuario",
    "RegistroAdmision",
    "SignosVitales",
    "RegistroEnfermeria"
] 