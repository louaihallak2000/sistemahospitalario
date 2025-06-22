from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
import logging

from app.core.database import get_db
from app.api.v1.auth import get_hospital_id, get_current_user_token
from app.schemas.paciente import (
    PacienteCreate, PacienteResponse, PacienteHospitalResponse,
    PacienteCompletoCreate, PacienteCompletoResponse
)
from app.services.paciente_service import PacienteService

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[PacienteHospitalResponse])
async def get_pacientes(
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener lista de todos los pacientes del hospital"""
    try:
        logger.debug(f"Obteniendo pacientes para hospital: {hospital_id}")
        pacientes = PacienteService.get_all_pacientes(db, hospital_id)
        logger.debug(f"Encontrados {len(pacientes)} pacientes")
        return pacientes
    except Exception as e:
        logger.error(f"Error obteniendo pacientes: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener pacientes: {str(e)}"
        )

@router.get("/{dni}", response_model=PacienteHospitalResponse)
async def get_paciente_by_dni(
    dni: str,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Buscar paciente por DNI en el contexto del hospital actual"""
    try:
        logger.debug(f"Buscando paciente con DNI: {dni} en hospital: {hospital_id}")
        paciente = PacienteService.get_paciente_by_dni(db, dni, hospital_id)
        
        if not paciente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paciente no encontrado en este hospital"
            )
        
        return paciente
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error buscando paciente: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al buscar paciente: {str(e)}"
        )

@router.post("/", response_model=PacienteResponse)
async def create_paciente(
    paciente_data: PacienteCreate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear un nuevo paciente"""
    try:
        logger.debug(f"Creando paciente: {paciente_data.dni} en hospital: {hospital_id}")
        paciente = PacienteService.create_paciente(db, paciente_data, hospital_id)
        logger.info(f"Paciente creado exitosamente: {paciente.id}")
        return paciente
    except Exception as e:
        logger.error(f"Error creando paciente: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear paciente: {str(e)}"
        )

@router.post("/completo", response_model=PacienteCompletoResponse)
async def create_paciente_completo(
    datos: PacienteCompletoCreate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear un nuevo paciente con episodio inicial (triaje)"""
    try:
        logger.debug(f"Creando paciente completo: {datos.dni} en hospital: {hospital_id}")
        resultado = PacienteService.create_paciente_completo(db, datos, hospital_id)
        logger.info(f"Paciente y episodio creados exitosamente")
        return resultado
    except Exception as e:
        logger.error(f"Error creando paciente completo: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear paciente completo: {str(e)}"
        ) 