from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from fastapi import HTTPException, status
from typing import Optional, List
from datetime import datetime, timedelta
from uuid import UUID
import json

from app.models.paciente import Paciente, PacienteHospital
from app.models.episodio import Episodio
from app.schemas.paciente import (
    PacienteCreate, PacienteHospitalCreate, PacienteResponse, 
    PacienteHospitalResponse, PacienteCompletoCreate, PacienteCompletoResponse
)
from app.schemas.episodio import (
    EpisodioCreate, EpisodioResponse, EpisodioListaEspera,
    EstadisticasTriaje, EstadisticasHospital
)

class PacienteService:
    @staticmethod
    def get_paciente_by_dni(db: Session, dni: str, hospital_id: str) -> Optional[PacienteHospitalResponse]:
        """Busca un paciente por DNI en el contexto de un hospital específico"""
        paciente_hospital = db.query(PacienteHospital).join(Paciente).filter(
            and_(
                Paciente.dni == dni,
                PacienteHospital.hospital_id == hospital_id
            )
        ).first()
        
        if not paciente_hospital:
            return None
            
        return paciente_hospital
    
    @staticmethod
    def create_paciente(db: Session, paciente_data: PacienteCreate, hospital_id: str) -> PacienteResponse:
        """Crea un nuevo paciente"""
        # Verificar si el DNI ya existe
        existing_paciente = db.query(Paciente).filter(Paciente.dni == paciente_data.dni).first()
        if existing_paciente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un paciente con este DNI"
            )
        
        # Crear paciente
        db_paciente = Paciente(**paciente_data.dict())
        db.add(db_paciente)
        db.flush()  # Para obtener el ID
        
        # Crear relación con hospital
        paciente_hospital = PacienteHospital(
            paciente_id=db_paciente.id,
            hospital_id=hospital_id,
            fecha_primera_atencion=datetime.utcnow()
        )
        db.add(paciente_hospital)
        db.commit()
        db.refresh(db_paciente)
        
        return db_paciente
    
    @staticmethod
    def create_paciente_completo(db: Session, datos: PacienteCompletoCreate, hospital_id: str) -> PacienteCompletoResponse:
        """Crea un nuevo paciente con episodio inicial"""
        try:
            # Verificar si el DNI ya existe
            existing_paciente = db.query(Paciente).filter(Paciente.dni == datos.dni).first()
            if existing_paciente:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ya existe un paciente con este DNI"
                )
            
            # Crear paciente
            paciente_data = {
                'dni': datos.dni,
                'nombre_completo': datos.nombre_completo,
                'fecha_nacimiento': datos.fecha_nacimiento,
                'sexo': datos.sexo,
                'tipo_sangre': datos.tipo_sangre,
                'alergias_conocidas': datos.alergias_conocidas
            }
            db_paciente = Paciente(**paciente_data)
            db.add(db_paciente)
            db.flush()  # Para obtener el ID
            
            # Crear relación con hospital
            paciente_hospital_data = {
                'paciente_id': db_paciente.id,
                'hospital_id': hospital_id,
                'fecha_primera_atencion': datetime.utcnow(),
                'telefono': datos.telefono,
                'direccion': datos.direccion,
                'contacto_emergencia': datos.contacto_emergencia,
                'obra_social': datos.obra_social,
                'numero_afiliado': datos.numero_afiliado
            }
            paciente_hospital = PacienteHospital(**paciente_hospital_data)
            db.add(paciente_hospital)
            db.flush()
            
            # Crear episodio inicial
            datos_triaje = {
                'motivo_consulta': datos.motivo_consulta,
                'color_triaje': datos.color_triaje,
                'fecha_triaje': datetime.utcnow().isoformat()
            }
            
            episodio_data = {
                'paciente_id': db_paciente.id,
                'hospital_id': hospital_id,
                'tipo': datos.tipo_episodio,
                'estado': 'activo',
                'medico_responsable': datos.medico_responsable,
                'diagnostico_principal': datos.motivo_consulta,
                'datos_json': json.dumps(datos_triaje)  # Convertir a JSON string
            }
            db_episodio = Episodio(**episodio_data)
            db.add(db_episodio)
            
            db.commit()
            db.refresh(db_paciente)
            db.refresh(db_episodio)
            
            return PacienteCompletoResponse(
                paciente=db_paciente,
                episodio={
                    'id': str(db_episodio.id),
                    'tipo': db_episodio.tipo,
                    'estado': db_episodio.estado,
                    'fecha_inicio': db_episodio.fecha_inicio.isoformat(),
                    'color_triaje': datos.color_triaje,
                    'motivo_consulta': datos.motivo_consulta
                }
            )
            
        except Exception as e:
            db.rollback()
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear paciente: {str(e)}"
            )
    
    @staticmethod
    def create_episodio(db: Session, episodio_data: EpisodioCreate, hospital_id: str) -> EpisodioResponse:
        """Crea un nuevo episodio médico"""
        # Verificar que el paciente existe y pertenece al hospital
        paciente_hospital = db.query(PacienteHospital).filter(
            and_(
                PacienteHospital.paciente_id == episodio_data.paciente_id,
                PacienteHospital.hospital_id == hospital_id
            )
        ).first()
        
        if not paciente_hospital:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paciente no encontrado en este hospital"
            )
        
        # Crear episodio
        episodio_dict = episodio_data.dict()
        episodio_dict['hospital_id'] = hospital_id
        
        db_episodio = Episodio(**episodio_dict)
        db.add(db_episodio)
        
        # Actualizar fecha de última atención
        paciente_hospital.fecha_ultima_atencion = datetime.utcnow()
        
        db.commit()
        db.refresh(db_episodio)
        
        return db_episodio
    
    @staticmethod
    def get_lista_espera(db: Session, hospital_id: str, estado: str = "activo") -> List[EpisodioListaEspera]:
        """Obtiene la lista de espera de episodios para un hospital"""
        episodios = db.query(
            Episodio.id,
            Paciente.dni.label('paciente_dni'),
            Paciente.nombre_completo.label('paciente_nombre'),
            Paciente.fecha_nacimiento,
            Episodio.tipo,
            Episodio.fecha_inicio,
            Episodio.estado,
            Episodio.medico_responsable,
            Episodio.diagnostico_principal,
            Episodio.datos_json
        ).join(Paciente, Episodio.paciente_id == Paciente.id).filter(
            and_(
                Episodio.hospital_id == hospital_id,
                Episodio.estado == estado
            )
        ).order_by(Episodio.fecha_inicio).all()
        
        resultado = []
        for episodio in episodios:
            # Calcular edad
            edad = None
            if episodio.fecha_nacimiento:
                today = datetime.now().date()
                edad = today.year - episodio.fecha_nacimiento.year
                if today.month < episodio.fecha_nacimiento.month or \
                   (today.month == episodio.fecha_nacimiento.month and today.day < episodio.fecha_nacimiento.day):
                    edad -= 1
            
            # Extraer información de triaje del JSON
            datos_triaje = {}
            if episodio.datos_json:
                try:
                    if isinstance(episodio.datos_json, str):
                        datos_triaje = json.loads(episodio.datos_json)
                    else:
                        datos_triaje = episodio.datos_json
                except:
                    datos_triaje = {}
            
            # Calcular tiempo de espera
            tiempo_espera = int((datetime.utcnow() - episodio.fecha_inicio).total_seconds() / 60)
            
            resultado.append(EpisodioListaEspera(
                id=episodio.id,
                paciente_dni=episodio.paciente_dni,
                paciente_nombre=episodio.paciente_nombre,
                paciente_edad=edad,
                tipo=episodio.tipo,
                fecha_inicio=episodio.fecha_inicio,
                estado=episodio.estado,
                medico_responsable=episodio.medico_responsable,
                motivo_consulta=datos_triaje.get('motivo_consulta') or episodio.diagnostico_principal,
                color_triaje=datos_triaje.get('color_triaje'),
                tiempo_espera_minutos=tiempo_espera
            ))
        
        return resultado
    
    @staticmethod
    def get_estadisticas_hospital(db: Session, hospital_id: str) -> EstadisticasHospital:
        """Obtiene estadísticas reales del hospital"""
        # Obtener episodios activos
        episodios_activos = db.query(Episodio).filter(
            and_(
                Episodio.hospital_id == hospital_id,
                Episodio.estado == 'activo'
            )
        ).all()
        
        # Contar por color de triaje
        stats = EstadisticasTriaje()
        tiempos_espera = []
        
        for episodio in episodios_activos:
            if episodio.datos_json:
                try:
                    datos = episodio.datos_json if isinstance(episodio.datos_json, dict) else json.loads(episodio.datos_json)
                    color = datos.get('color_triaje')
                    if color and hasattr(stats, color):
                        setattr(stats, color, getattr(stats, color) + 1)
                except:
                    pass
            
            # Calcular tiempo de espera
            tiempo_espera = (datetime.utcnow() - episodio.fecha_inicio).total_seconds() / 60
            tiempos_espera.append(tiempo_espera)
        
        # Calcular promedio de tiempo de espera
        promedio_tiempo = sum(tiempos_espera) / len(tiempos_espera) if tiempos_espera else 0
        
        # Generar alertas si es necesario
        alerts = []
        if stats.ROJO > 0:
            alerts.append({
                'id': 'rojo_alert',
                'type': 'critical',
                'message': f'{stats.ROJO} paciente(s) crítico(s) en espera',
                'severity': 'high'
            })
        
        if promedio_tiempo > 60:  # Más de 1 hora promedio
            alerts.append({
                'id': 'tiempo_alert',
                'type': 'warning',
                'message': f'Tiempo promedio de espera: {promedio_tiempo:.0f} minutos',
                'severity': 'medium'
            })
        
        return EstadisticasHospital(
            triageStats=stats,
            alerts=alerts,
            total_pacientes_espera=len(episodios_activos),
            promedio_tiempo_espera=promedio_tiempo
        ) 