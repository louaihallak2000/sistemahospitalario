from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.core.database import get_db
from app.api.v1.auth import get_current_user_token
from app.models.shockroom import ShockroomCama, ShockroomAsignacion, ShockroomAlerta
from app.models.paciente import Paciente
from app.models.episodio import Episodio
from app.schemas.shockroom import (
    ShockroomCama as ShockroomCamaSchema,
    ShockroomCamaCreate,
    ShockroomCamaUpdate,
    ShockroomCamaDetallada,
    ShockroomAsignacion as ShockroomAsignacionSchema,
    ShockroomAsignacionCreate,
    ShockroomAsignacionUpdate,
    ShockroomAlerta as ShockroomAlertaSchema,
    ShockroomAlertaCreate,
    ShockroomAlertaUpdate,
    ShockroomEstadisticas,
    ShockroomPacienteInfo,
    MonitorizacionDatos
)

router = APIRouter()

# ENDPOINTS PARA CAMAS

@router.get("/camas", response_model=List[ShockroomCamaDetallada])
async def get_shockroom_camas(
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener todas las camas del shockroom con información detallada"""
    hospital_id = auth_data["hospital_id"]
    
    # Obtener camas con asignaciones activas
    camas = db.query(ShockroomCama).options(
        joinedload(ShockroomCama.asignaciones)
    ).filter(ShockroomCama.hospital_id == hospital_id).all()
    
    resultado = []
    for cama in camas:
        # Buscar asignación activa
        asignacion_actual = next(
            (a for a in cama.asignaciones if a.fecha_salida is None), 
            None
        )
        
        paciente_nombre = None
        tiempo_ocupacion = None
        alertas_activas = []
        
        if asignacion_actual:
            # Obtener información del paciente
            paciente = db.query(Paciente).filter(
                Paciente.id == asignacion_actual.paciente_id
            ).first()
            if paciente:
                paciente_nombre = f"{paciente.nombre_completo or f'{paciente.primer_nombre} {paciente.primer_apellido}'}"
            
            # Calcular tiempo de ocupación
            tiempo_ocupacion = int((datetime.utcnow() - asignacion_actual.fecha_ingreso).total_seconds() / 60)
            
            # Obtener alertas activas
            alertas_activas = db.query(ShockroomAlerta).filter(
                and_(
                    ShockroomAlerta.asignacion_id == asignacion_actual.id,
                    ShockroomAlerta.estado == "activa"
                )
            ).all()
        
        resultado.append(ShockroomCamaDetallada(
            **cama.__dict__,
            asignacion_actual=asignacion_actual,
            paciente_nombre=paciente_nombre,
            tiempo_ocupacion=tiempo_ocupacion,
            alertas_activas=alertas_activas
        ))
    
    return resultado

@router.post("/camas", response_model=ShockroomCamaSchema)
async def create_cama(
    cama_data: ShockroomCamaCreate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear una nueva cama en el shockroom"""
    # Verificar que el número de cama no exista
    existing = db.query(ShockroomCama).filter(
        and_(
            ShockroomCama.hospital_id == cama_data.hospital_id,
            ShockroomCama.numero_cama == cama_data.numero_cama
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una cama con ese número"
        )
    
    cama = ShockroomCama(
        **cama_data.dict(),
        equipamiento=json.dumps(cama_data.equipamiento or [])
    )
    db.add(cama)
    db.commit()
    db.refresh(cama)
    
    return cama

@router.put("/camas/{cama_id}", response_model=ShockroomCamaSchema)
async def update_cama(
    cama_id: str,
    cama_update: ShockroomCamaUpdate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Actualizar una cama del shockroom"""
    cama = db.query(ShockroomCama).filter(ShockroomCama.id == cama_id).first()
    if not cama:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cama no encontrada"
        )
    
    for field, value in cama_update.dict(exclude_unset=True).items():
        if field == "equipamiento" and value is not None:
            value = json.dumps(value)
        setattr(cama, field, value)
    
    cama.fecha_actualizacion = datetime.utcnow()
    db.commit()
    db.refresh(cama)
    
    return cama

# ENDPOINTS PARA ASIGNACIONES

@router.post("/asignaciones", response_model=ShockroomAsignacionSchema)
async def crear_asignacion(
    asignacion_data: ShockroomAsignacionCreate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Asignar un paciente a una cama del shockroom"""
    # Verificar que la cama esté disponible
    cama = db.query(ShockroomCama).filter(ShockroomCama.id == asignacion_data.cama_id).first()
    if not cama:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cama no encontrada"
        )
    
    if cama.estado != "disponible":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La cama no está disponible"
        )
    
    # Verificar que el episodio no esté ya asignado
    asignacion_existente = db.query(ShockroomAsignacion).filter(
        and_(
            ShockroomAsignacion.episodio_id == asignacion_data.episodio_id,
            ShockroomAsignacion.fecha_salida.is_(None)
        )
    ).first()
    
    if asignacion_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El paciente ya está asignado a otra cama"
        )
    
    # Crear asignación
    asignacion = ShockroomAsignacion(
        **asignacion_data.dict(),
        equipos_utilizados=json.dumps(asignacion_data.equipos_utilizados or [])
    )
    db.add(asignacion)
    
    # Actualizar estado de la cama
    cama.estado = "ocupada"
    
    # Actualizar estado del episodio
    episodio = db.query(Episodio).filter(Episodio.id == asignacion_data.episodio_id).first()
    if episodio:
        episodio.estado = "En shockroom"
    
    db.commit()
    db.refresh(asignacion)
    
    return asignacion

@router.put("/asignaciones/{asignacion_id}/salida")
async def dar_salida_shockroom(
    asignacion_id: str,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Dar salida a un paciente del shockroom"""
    asignacion = db.query(ShockroomAsignacion).filter(
        ShockroomAsignacion.id == asignacion_id
    ).first()
    
    if not asignacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asignación no encontrada"
        )
    
    if asignacion.fecha_salida:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El paciente ya fue dado de salida"
        )
    
    # Marcar salida
    asignacion.fecha_salida = datetime.utcnow()
    
    # Liberar cama
    cama = db.query(ShockroomCama).filter(ShockroomCama.id == asignacion.cama_id).first()
    if cama:
        cama.estado = "limpieza"  # Requiere limpieza antes de estar disponible
    
    # Actualizar estado del episodio
    episodio = db.query(Episodio).filter(Episodio.id == asignacion.episodio_id).first()
    if episodio:
        episodio.estado = "En espera de atención"
    
    db.commit()
    
    return {"message": "Salida registrada exitosamente"}

@router.put("/asignaciones/{asignacion_id}/monitorizacion")
async def actualizar_monitorizacion(
    asignacion_id: str,
    datos: MonitorizacionDatos,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Actualizar datos de monitorización de un paciente"""
    asignacion = db.query(ShockroomAsignacion).filter(
        ShockroomAsignacion.id == asignacion_id
    ).first()
    
    if not asignacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asignación no encontrada"
        )
    
    # Obtener datos existentes o crear nuevo dict
    datos_existentes = json.loads(asignacion.datos_monitorizacion or "{}")
    
    # Agregar nuevo registro
    timestamp = datos.timestamp.isoformat()
    datos_existentes[timestamp] = datos.dict(exclude={"timestamp"})
    
    asignacion.datos_monitorizacion = json.dumps(datos_existentes)
    db.commit()
    
    return {"message": "Datos de monitorización actualizados"}

# ENDPOINTS PARA ALERTAS

@router.post("/alertas", response_model=ShockroomAlertaSchema)
async def crear_alerta(
    alerta_data: ShockroomAlertaCreate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear una nueva alerta para el shockroom"""
    alerta = ShockroomAlerta(
        **alerta_data.dict(),
        creada_por=alerta_data.creada_por or auth_data.get("username")
    )
    db.add(alerta)
    db.commit()
    db.refresh(alerta)
    
    return alerta

@router.get("/alertas", response_model=List[ShockroomAlertaSchema])
async def get_alertas(
    estado: Optional[str] = "activa",
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener alertas del shockroom"""
    hospital_id = auth_data["hospital_id"]
    
    query = db.query(ShockroomAlerta).join(
        ShockroomAsignacion
    ).join(
        ShockroomCama
    ).filter(
        ShockroomCama.hospital_id == hospital_id
    )
    
    if estado:
        query = query.filter(ShockroomAlerta.estado == estado)
    
    alertas = query.order_by(ShockroomAlerta.fecha_creacion.desc()).all()
    return alertas

@router.put("/alertas/{alerta_id}/atender")
async def atender_alerta(
    alerta_id: str,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Marcar una alerta como atendida"""
    alerta = db.query(ShockroomAlerta).filter(ShockroomAlerta.id == alerta_id).first()
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada"
        )
    
    alerta.estado = "atendida"
    alerta.atendida_por = auth_data.get("username")
    alerta.fecha_atencion = datetime.utcnow()
    
    db.commit()
    return {"message": "Alerta marcada como atendida"}

# ENDPOINTS DE ESTADÍSTICAS Y DATOS

@router.get("/estadisticas", response_model=ShockroomEstadisticas)
async def get_estadisticas(
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener estadísticas del shockroom"""
    hospital_id = auth_data["hospital_id"]
    
    # Contar camas por estado
    estadisticas_camas = db.query(
        ShockroomCama.estado,
        func.count(ShockroomCama.id)
    ).filter(
        ShockroomCama.hospital_id == hospital_id
    ).group_by(ShockroomCama.estado).all()
    
    stats = {estado: count for estado, count in estadisticas_camas}
    total_camas = sum(stats.values())
    
    # Contar alertas activas
    alertas_activas = db.query(ShockroomAlerta).join(
        ShockroomAsignacion
    ).join(
        ShockroomCama
    ).filter(
        and_(
            ShockroomCama.hospital_id == hospital_id,
            ShockroomAlerta.estado == "activa"
        )
    ).count()
    
    # Contar pacientes críticos
    pacientes_criticos = db.query(ShockroomAsignacion).join(
        ShockroomCama
    ).filter(
        and_(
            ShockroomCama.hospital_id == hospital_id,
            ShockroomAsignacion.fecha_salida.is_(None),
            ShockroomAsignacion.estado_paciente == "critico"
        )
    ).count()
    
    # Calcular tiempo promedio de estancia (últimos 30 días)
    fecha_limite = datetime.utcnow() - timedelta(days=30)
    tiempos_estancia = db.query(
        func.extract('epoch', ShockroomAsignacion.fecha_salida - ShockroomAsignacion.fecha_ingreso) / 3600
    ).join(ShockroomCama).filter(
        and_(
            ShockroomCama.hospital_id == hospital_id,
            ShockroomAsignacion.fecha_salida.isnot(None),
            ShockroomAsignacion.fecha_ingreso >= fecha_limite
        )
    ).all()
    
    tiempo_promedio = sum(tiempo[0] for tiempo in tiempos_estancia if tiempo[0]) / len(tiempos_estancia) if tiempos_estancia else None
    
    return ShockroomEstadisticas(
        total_camas=total_camas,
        camas_disponibles=stats.get("disponible", 0),
        camas_ocupadas=stats.get("ocupada", 0),
        camas_mantenimiento=stats.get("mantenimiento", 0),
        camas_limpieza=stats.get("limpieza", 0),
        tasa_ocupacion=round((stats.get("ocupada", 0) / total_camas * 100) if total_camas > 0 else 0, 2),
        tiempo_promedio_estancia=tiempo_promedio,
        alertas_activas=alertas_activas,
        pacientes_criticos=pacientes_criticos
    )

@router.get("/pacientes-candidatos", response_model=List[ShockroomPacienteInfo])
async def get_pacientes_candidatos(
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener pacientes candidatos para el shockroom (triaje ROJO/NARANJA)"""
    hospital_id = auth_data["hospital_id"]
    
    # Buscar episodios con triaje crítico que no estén en shockroom
    episodios = db.query(Episodio).join(Paciente).filter(
        and_(
            Episodio.hospital_id == hospital_id,
            Episodio.estado.in_(["En espera de atención", "En atención"]),
            or_(
                Episodio.color_triaje == "ROJO",
                Episodio.color_triaje == "NARANJA"
            )
        )
    ).all()
    
    # Filtrar los que no están ya en shockroom
    episodios_en_shockroom = db.query(ShockroomAsignacion.episodio_id).filter(
        ShockroomAsignacion.fecha_salida.is_(None)
    ).subquery()
    
    candidatos = []
    for episodio in episodios:
        # Verificar si ya está en shockroom
        ya_en_shockroom = db.query(ShockroomAsignacion).filter(
            and_(
                ShockroomAsignacion.episodio_id == episodio.id,
                ShockroomAsignacion.fecha_salida.is_(None)
            )
        ).first()
        
        if not ya_en_shockroom:
            paciente = db.query(Paciente).filter(Paciente.id == episodio.paciente_id).first()
            if paciente:
                # Calcular edad
                edad = None
                if paciente.fecha_nacimiento:
                    edad = datetime.utcnow().year - paciente.fecha_nacimiento.year
                
                # Calcular tiempo de espera
                tiempo_espera = int((datetime.utcnow() - episodio.fecha_inicio).total_seconds() / 60)
                
                candidatos.append(ShockroomPacienteInfo(
                    episodio_id=episodio.id,
                    paciente_id=paciente.id,
                    paciente_nombre=paciente.nombre_completo or f"{paciente.primer_nombre} {paciente.primer_apellido}",
                    paciente_dni=paciente.dni,
                    edad=edad,
                    triaje_color=episodio.color_triaje,
                    motivo_consulta=episodio.motivo_consulta,
                    tiempo_espera=tiempo_espera,
                    puede_asignar_shockroom=True
                ))
    
    return candidatos 