from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.api.v1.auth import get_hospital_id, get_current_user_token
from app.schemas.paciente import (
    PacienteCreate, PacienteResponse, PacienteHospitalResponse,
    PacienteCompletoCreate, PacienteCompletoResponse
)
from app.services.paciente_service import PacienteService

router = APIRouter()

@router.get("/{dni}", response_model=PacienteHospitalResponse)
async def get_paciente_by_dni(
    dni: str,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Buscar paciente por DNI en el contexto del hospital actual"""
    paciente = PacienteService.get_paciente_by_dni(db, dni, hospital_id)
    
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado en este hospital"
        )
    
    return paciente

@router.post("/", response_model=PacienteResponse)
async def create_paciente(
    paciente_data: PacienteCreate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear un nuevo paciente"""
    return PacienteService.create_paciente(db, paciente_data, hospital_id)

@router.post("/completo", response_model=PacienteCompletoResponse)
async def create_paciente_completo(
    datos: PacienteCompletoCreate,
    hospital_id: str = Depends(get_hospital_id),
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear un nuevo paciente con episodio inicial (triaje)"""
    return PacienteService.create_paciente_completo(db, datos, hospital_id) 