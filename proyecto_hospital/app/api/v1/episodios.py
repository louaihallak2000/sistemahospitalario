from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, desc, or_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json
import logging

from app.core.database import get_db
from app.api.v1.auth import get_hospital_id, get_current_user_token
from app.models.episodio import Episodio
from app.models.paciente import Paciente
from app.models.shockroom import ShockroomCama, ShockroomAsignacion

router = APIRouter()
logger = logging.getLogger(__name__)

# SCHEMAS SEGÚN EL NUEVO WORKFLOW

class EpisodioCreate(BaseModel):
    paciente_id: str
    tipo: str = "consulta"
    motivo_consulta: str
    hospital_origen: Optional[str] = None
    motivo_traslado: Optional[str] = None

class EpisodioResponse(BaseModel):
    id: str
    paciente_id: str
    hospital_id: str
    estado: str
    color_triaje: Optional[str] = None
    motivo_consulta: Optional[str] = None
    fecha_inicio: datetime
    triaje_realizado_por: Optional[str] = None
    fecha_triaje: Optional[datetime] = None
    decision_post_triaje: Optional[str] = None
    medico_responsable: Optional[str] = None
    en_shockroom: bool = False
    cama_shockroom: Optional[str] = None
    
    class Config:
        from_attributes = True

class TriajeRequest(BaseModel):
    color_triaje: str  # ROJO, NARANJA, AMARILLO, VERDE, AZUL
    signos_vitales: dict
    evaluacion_enfermeria: str

class DecisionPostTriajeRequest(BaseModel):
    decision: str  # lista_medica, alta_enfermeria, shockroom
    observaciones: Optional[str] = None
    cama_shockroom: Optional[str] = None  # Solo si decision = shockroom

class PrescripcionCreate(BaseModel):
    medicamento: str
    dosis: str
    frecuencia: str
    via_administracion: str
    duracion: str
    observaciones: str = ""

class ProcedimientoCreate(BaseModel):
    nombre: str
    descripcion: str
    prioridad: str = "normal"  # normal, urgente, critico
    observaciones: str = ""

class EstudioCreate(BaseModel):
    tipo: str  # laboratorio, radiologia, cardiologia, etc.
    nombre: str
    prioridad: str = "normal"
    observaciones: str = ""

class EvolucionMedicaCreate(BaseModel):
    evolucion: str
    plan: str
    estado_paciente: str = "estable"

class IndicacionMonitoreoCreate(BaseModel):
    tipo_control: str  # signos_vitales, presion, temperatura, etc.
    frecuencia_minutos: int
    observaciones: str = ""

class DecisionFinalRequest(BaseModel):
    decision: str  # alta, internacion, continua
    indicaciones_alta: Optional[str] = None
    area_internacion: Optional[str] = None
    motivo_continuacion: Optional[str] = None

# ENDPOINTS PRINCIPALES DEL WORKFLOW

@router.get("/espera-triaje", response_model=List[EpisodioResponse])
async def get_episodios_espera_triaje(
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener episodios en espera de triaje (para enfermería)"""
    hospital_id = auth_data["hospital_id"]
    
    episodios = db.query(Episodio).options(
        joinedload(Episodio.paciente)
    ).filter(
        and_(
            Episodio.hospital_id == hospital_id,
            Episodio.estado == "espera_triaje"
        )
    ).order_by(Episodio.fecha_inicio).all()
    
    return episodios

@router.get("/lista-medica", response_model=List[EpisodioResponse])
async def get_episodios_lista_medica(
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener episodios en lista médica (para médicos)"""
    hospital_id = auth_data["hospital_id"]
    
    episodios = db.query(Episodio).options(
        joinedload(Episodio.paciente)
    ).filter(
        and_(
            Episodio.hospital_id == hospital_id,
            Episodio.estado == "en_lista_medica"
        )
    ).order_by(
        # Ordenar por prioridad de triaje
        Episodio.color_triaje.desc(),
        Episodio.fecha_triaje
    ).all()
    
    return episodios

@router.post("/", response_model=EpisodioResponse)
async def create_episodio(
    episodio_data: EpisodioCreate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear nuevo episodio (después de admisión)"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    # Verificar que el paciente existe
    paciente = db.query(Paciente).filter(Paciente.id == episodio_data.paciente_id).first()
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado"
        )
    
    # Crear episodio
    episodio = Episodio(
        paciente_id=episodio_data.paciente_id,
        hospital_id=hospital_id,
        tipo=episodio_data.tipo,
        motivo_consulta=episodio_data.motivo_consulta,
        hospital_origen=episodio_data.hospital_origen,
        motivo_traslado=episodio_data.motivo_traslado,
        creado_por=username,
        estado="espera_triaje"  # Estado inicial según workflow
    )
    
    db.add(episodio)
    db.commit()
    db.refresh(episodio)
    
    return episodio

@router.put("/{episodio_id}/triaje")
async def asignar_triaje(
    episodio_id: str,
    triaje_data: TriajeRequest,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Asignar triaje a un episodio (enfermería)"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    episodio = db.query(Episodio).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id,
            Episodio.estado == "espera_triaje"
        )
    ).first()
    
    if not episodio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Episodio no encontrado o ya procesado"
        )
    
    # Validar color de triaje
    colores_validos = ["ROJO", "NARANJA", "AMARILLO", "VERDE", "AZUL"]
    if triaje_data.color_triaje not in colores_validos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Color de triaje no válido"
        )
    
    # Actualizar episodio con triaje
    episodio.color_triaje = triaje_data.color_triaje
    episodio.triaje_realizado_por = username
    episodio.fecha_triaje = datetime.utcnow()
    episodio.signos_vitales_triaje = json.dumps(triaje_data.signos_vitales)
    episodio.evaluacion_enfermeria = triaje_data.evaluacion_enfermeria
    episodio.modificado_por = username
    
    db.commit()
    
    return {"message": "Triaje asignado exitosamente"}

@router.put("/{episodio_id}/decision-post-triaje")
async def tomar_decision_post_triaje(
    episodio_id: str,
    decision_data: DecisionPostTriajeRequest,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Tomar decisión después del triaje (enfermería)"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    episodio = db.query(Episodio).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id,
            Episodio.color_triaje.isnot(None)  # Debe tener triaje asignado
        )
    ).first()
    
    if not episodio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Episodio no encontrado o sin triaje"
        )
    
    # Validar decisión
    decisiones_validas = ["lista_medica", "alta_enfermeria", "shockroom"]
    if decision_data.decision not in decisiones_validas:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decisión no válida"
        )
    
    # Procesar según la decisión
    if decision_data.decision == "lista_medica":
        episodio.estado = "en_lista_medica"
        episodio.decision_post_triaje = "lista_medica"
        
    elif decision_data.decision == "alta_enfermeria":
        episodio.estado = "alta_enfermeria"
        episodio.decision_post_triaje = "alta_enfermeria"
        episodio.fecha_cierre = datetime.utcnow()
        
    elif decision_data.decision == "shockroom":
        if not decision_data.cama_shockroom:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe especificar la cama del shockroom"
            )
        
        # Verificar que la cama esté disponible
        cama = db.query(ShockroomCama).filter(
            and_(
                ShockroomCama.hospital_id == hospital_id,
                ShockroomCama.numero_cama == decision_data.cama_shockroom,
                ShockroomCama.estado == "disponible"
            )
        ).first()
        
        if not cama:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cama no disponible"
            )
        
        # Actualizar episodio
        episodio.estado = "en_shockroom"
        episodio.decision_post_triaje = "shockroom"
        episodio.en_shockroom = True
        episodio.cama_shockroom = decision_data.cama_shockroom
        episodio.fecha_ingreso_shockroom = datetime.utcnow()
        
        # Crear asignación en shockroom
        asignacion = ShockroomAsignacion(
            cama_id=cama.id,
            episodio_id=episodio.id,
            paciente_id=episodio.paciente_id,
            motivo_ingreso=f"Triaje {episodio.color_triaje} - Decisión enfermería"
        )
        db.add(asignacion)
        
        # Cambiar estado de la cama
        cama.estado = "ocupada"
    
    episodio.decidido_por = username
    episodio.fecha_decision = datetime.utcnow()
    episodio.modificado_por = username
    
    db.commit()
    
    # TODO: Enviar notificación al médico si es shockroom
    
    return {"message": f"Decisión '{decision_data.decision}' aplicada exitosamente"}

@router.put("/{episodio_id}/tomar-paciente")
async def tomar_paciente(
    episodio_id: str,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Médico toma un paciente de la lista médica"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    episodio = db.query(Episodio).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id,
            Episodio.estado == "en_lista_medica"
        )
    ).first()
    
    if not episodio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Episodio no encontrado o no disponible"
        )
    
    # Actualizar episodio
    episodio.estado = "en_atencion"
    episodio.medico_responsable = username
    episodio.fecha_inicio_atencion = datetime.utcnow()
    episodio.modificado_por = username
    
    db.commit()
    
    return {"message": "Paciente tomado exitosamente"}

# ENDPOINTS PARA ATENCIÓN MÉDICA

@router.post("/{episodio_id}/prescripciones")
async def crear_prescripcion(
    episodio_id: str,
    prescripcion_data: PrescripcionCreate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear prescripción médica"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    episodio = db.query(Episodio).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id
        )
    ).first()
    
    if not episodio:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    # Obtener prescripciones existentes
    prescripciones = json.loads(episodio.prescripciones or "[]")
    
    # Crear nueva prescripción
    nueva_prescripcion = {
        "id": f"pre_{int(datetime.now().timestamp() * 1000)}",
        "medicamento": prescripcion_data.medicamento,
        "dosis": prescripcion_data.dosis,
        "frecuencia": prescripcion_data.frecuencia,
        "via_administracion": prescripcion_data.via_administracion,
        "duracion": prescripcion_data.duracion,
        "observaciones": prescripcion_data.observaciones,
        "estado": "pendiente",
        "prescrito_por": username,
        "fecha_prescripcion": datetime.now().isoformat(),
        "administrado": False
    }
    
    prescripciones.append(nueva_prescripcion)
    episodio.prescripciones = json.dumps(prescripciones)
    episodio.modificado_por = username
    
    db.commit()
    
    return {"message": "Prescripción creada exitosamente", "prescripcion": nueva_prescripcion}

@router.post("/{episodio_id}/procedimientos")
async def crear_procedimiento(
    episodio_id: str,
    procedimiento_data: ProcedimientoCreate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear indicación de procedimiento"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    episodio = db.query(Episodio).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id
        )
    ).first()
    
    if not episodio:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    # Obtener procedimientos existentes
    procedimientos = json.loads(episodio.procedimientos or "[]")
    
    # Crear nuevo procedimiento
    nuevo_procedimiento = {
        "id": f"proc_{int(datetime.now().timestamp() * 1000)}",
        "nombre": procedimiento_data.nombre,
        "descripcion": procedimiento_data.descripcion,
        "prioridad": procedimiento_data.prioridad,
        "observaciones": procedimiento_data.observaciones,
        "estado": "pendiente",
        "indicado_por": username,
        "fecha_indicacion": datetime.now().isoformat(),
        "completado": False
    }
    
    procedimientos.append(nuevo_procedimiento)
    episodio.procedimientos = json.dumps(procedimientos)
    episodio.modificado_por = username
    
    db.commit()
    
    return {"message": "Procedimiento indicado exitosamente", "procedimiento": nuevo_procedimiento}

@router.post("/{episodio_id}/estudios")
async def solicitar_estudio(
    episodio_id: str,
    estudio_data: EstudioCreate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Solicitar estudio médico"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    episodio = db.query(Episodio).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id
        )
    ).first()
    
    if not episodio:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    # Obtener estudios existentes
    estudios = json.loads(episodio.estudios_solicitados or "[]")
    
    # Crear nuevo estudio
    nuevo_estudio = {
        "id": f"est_{int(datetime.now().timestamp() * 1000)}",
        "tipo": estudio_data.tipo,
        "nombre": estudio_data.nombre,
        "prioridad": estudio_data.prioridad,
        "observaciones": estudio_data.observaciones,
        "estado": "pendiente",
        "solicitado_por": username,
        "fecha_solicitud": datetime.now().isoformat(),
        "completado": False
    }
    
    estudios.append(nuevo_estudio)
    episodio.estudios_solicitados = json.dumps(estudios)
    episodio.modificado_por = username
    
    db.commit()
    
    return {"message": "Estudio solicitado exitosamente", "estudio": nuevo_estudio}

@router.post("/{episodio_id}/evoluciones")
async def crear_evolucion_medica(
    episodio_id: str,
    evolucion_data: EvolucionMedicaCreate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear evolución médica"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    episodio = db.query(Episodio).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id
        )
    ).first()
    
    if not episodio:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    # Obtener evoluciones existentes
    evoluciones = json.loads(episodio.evoluciones_medicas or "[]")
    
    # Crear nueva evolución
    nueva_evolucion = {
        "id": f"evo_{int(datetime.now().timestamp() * 1000)}",
        "evolucion": evolucion_data.evolucion,
        "plan": evolucion_data.plan,
        "estado_paciente": evolucion_data.estado_paciente,
        "medico": username,
        "fecha": datetime.now().isoformat()
    }
    
    evoluciones.append(nueva_evolucion)
    episodio.evoluciones_medicas = json.dumps(evoluciones)
    episodio.modificado_por = username
    
    db.commit()
    
    return {"message": "Evolución médica registrada exitosamente", "evolucion": nueva_evolucion}

@router.post("/{episodio_id}/indicaciones-monitoreo")
async def crear_indicacion_monitoreo(
    episodio_id: str,
    indicacion_data: IndicacionMonitoreoCreate,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Crear indicación de monitoreo (para enfermería)"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    episodio = db.query(Episodio).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id
        )
    ).first()
    
    if not episodio:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    # Obtener indicaciones existentes
    indicaciones = json.loads(episodio.indicaciones_monitoreo or "[]")
    
    # Crear nueva indicación
    nueva_indicacion = {
        "id": f"mon_{int(datetime.now().timestamp() * 1000)}",
        "tipo_control": indicacion_data.tipo_control,
        "frecuencia_minutos": indicacion_data.frecuencia_minutos,
        "observaciones": indicacion_data.observaciones,
        "estado": "activa",
        "indicado_por": username,
        "fecha_indicacion": datetime.now().isoformat()
    }
    
    indicaciones.append(nueva_indicacion)
    episodio.indicaciones_monitoreo = json.dumps(indicaciones)
    episodio.modificado_por = username
    
    db.commit()
    
    return {"message": "Indicación de monitoreo creada exitosamente", "indicacion": nueva_indicacion}

@router.put("/{episodio_id}/enviar-shockroom")
async def enviar_a_shockroom(
    episodio_id: str,
    cama_shockroom: str,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Médico envía paciente al shockroom"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    episodio = db.query(Episodio).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id,
            Episodio.estado == "en_atencion"
        )
    ).first()
    
    if not episodio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Episodio no encontrado o no en atención"
        )
    
    # Verificar cama disponible
    cama = db.query(ShockroomCama).filter(
        and_(
            ShockroomCama.hospital_id == hospital_id,
            ShockroomCama.numero_cama == cama_shockroom,
            ShockroomCama.estado == "disponible"
        )
    ).first()
    
    if not cama:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cama no disponible"
        )
    
    # Actualizar episodio
    episodio.estado = "en_shockroom"
    episodio.en_shockroom = True
    episodio.cama_shockroom = cama_shockroom
    episodio.fecha_ingreso_shockroom = datetime.utcnow()
    episodio.modificado_por = username
    
    # Crear asignación
    asignacion = ShockroomAsignacion(
        cama_id=cama.id,
        episodio_id=episodio.id,
        paciente_id=episodio.paciente_id,
        medico_responsable=username,
        motivo_ingreso=f"Decisión médica - {episodio.color_triaje or 'Sin triaje'}"
    )
    db.add(asignacion)
    
    # Cambiar estado cama
    cama.estado = "ocupada"
    
    db.commit()
    
    return {"message": f"Paciente enviado al shockroom, cama {cama_shockroom}"}

@router.put("/{episodio_id}/decision-final")
async def tomar_decision_final(
    episodio_id: str,
    decision_data: DecisionFinalRequest,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Tomar decisión médica final (OBLIGATORIA para cerrar episodio)"""
    hospital_id = auth_data["hospital_id"]
    username = auth_data["username"]
    
    episodio = db.query(Episodio).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id,
            Episodio.medico_responsable == username  # Solo el médico responsable
        )
    ).first()
    
    if not episodio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Episodio no encontrado o no autorizado"
        )
    
    # Validar decisión
    decisiones_validas = ["alta", "internacion", "continua"]
    if decision_data.decision not in decisiones_validas:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decisión final no válida"
        )
    
    # Aplicar decisión
    episodio.decision_final = decision_data.decision
    episodio.fecha_decision_final = datetime.utcnow()
    episodio.modificado_por = username
    
    if decision_data.decision == "alta":
        episodio.estado = "finalizado"
        episodio.fecha_cierre = datetime.utcnow()
        episodio.indicaciones_alta = decision_data.indicaciones_alta
        
    elif decision_data.decision == "internacion":
        episodio.estado = "finalizado"
        episodio.fecha_cierre = datetime.utcnow()
        episodio.area_internacion = decision_data.area_internacion
        
    elif decision_data.decision == "continua":
        episodio.estado = "en_atencion"  # Vuelve a atención
        episodio.motivo_continuacion = decision_data.motivo_continuacion
    
    # Si estaba en shockroom, liberar cama
    if episodio.en_shockroom and decision_data.decision in ["alta", "internacion"]:
        episodio.fecha_salida_shockroom = datetime.utcnow()
        episodio.en_shockroom = False
        
        # Liberar cama
        if episodio.cama_shockroom:
            cama = db.query(ShockroomCama).filter(
                and_(
                    ShockroomCama.hospital_id == hospital_id,
                    ShockroomCama.numero_cama == episodio.cama_shockroom
                )
            ).first()
            if cama:
                cama.estado = "limpieza"
        
        # Cerrar asignación
        asignacion = db.query(ShockroomAsignacion).filter(
            and_(
                ShockroomAsignacion.episodio_id == episodio.id,
                ShockroomAsignacion.fecha_salida.is_(None)
            )
        ).first()
        if asignacion:
            asignacion.fecha_salida = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"Decisión final '{decision_data.decision}' aplicada exitosamente"}

# ENDPOINTS DE CONSULTA

@router.get("/{episodio_id}")
async def get_episodio(
    episodio_id: str,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener detalles completos de un episodio"""
    hospital_id = auth_data["hospital_id"]
    
    episodio = db.query(Episodio).options(
        joinedload(Episodio.paciente)
    ).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id
        )
    ).first()
    
    if not episodio:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    return episodio

@router.get("/{episodio_id}/evoluciones-previas")
async def get_evoluciones_previas(
    episodio_id: str,
    db: Session = Depends(get_db),
    auth_data: dict = Depends(get_current_user_token)
):
    """Obtener evoluciones de episodios previos del mismo paciente"""
    hospital_id = auth_data["hospital_id"]
    
    # Obtener el episodio actual
    episodio_actual = db.query(Episodio).filter(
        and_(
            Episodio.id == episodio_id,
            Episodio.hospital_id == hospital_id
        )
    ).first()
    
    if not episodio_actual:
        raise HTTPException(status_code=404, detail="Episodio no encontrado")
    
    # Buscar episodios previos del mismo paciente
    episodios_previos = db.query(Episodio).filter(
        and_(
            Episodio.paciente_id == episodio_actual.paciente_id,
            Episodio.hospital_id == hospital_id,
            Episodio.id != episodio_id,
            Episodio.evoluciones_medicas.isnot(None)
        )
    ).order_by(desc(Episodio.fecha_inicio)).limit(5).all()
    
    evoluciones_previas = []
    for episodio in episodios_previos:
        if episodio.evoluciones_medicas:
            evoluciones = json.loads(episodio.evoluciones_medicas)
            for evolucion in evoluciones:
                evolucion["fecha_episodio"] = episodio.fecha_inicio.isoformat()
                evolucion["motivo_consulta"] = episodio.motivo_consulta
                evoluciones_previas.append(evolucion)
    
    return evoluciones_previas 