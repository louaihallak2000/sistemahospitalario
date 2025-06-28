"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Activity,
    AlertTriangle,
    Bed,
    Clock,
    Monitor,
    Settings,
    User,
    Wrench,
    Zap
} from "lucide-react"

interface ShockroomMapProps {
    camas: any[]
    onBedClick: (cama: any) => void
    selectedBed: any
}

export function ShockroomMap({ camas, onBedClick, selectedBed }: ShockroomMapProps) {
    const getBedColor = (estado: string) => {
        switch (estado) {
            case "disponible":
                return "bg-green-100 border-green-300 hover:bg-green-200"
            case "ocupada":
                return "bg-red-100 border-red-300 hover:bg-red-200"
            case "limpieza":
                return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200"
            case "mantenimiento":
                return "bg-blue-100 border-blue-300 hover:bg-blue-200"
            case "fuera_servicio":
                return "bg-gray-100 border-gray-300 hover:bg-gray-200"
            default:
                return "bg-gray-100 border-gray-300"
        }
    }

    const getBedIcon = (estado: string) => {
        switch (estado) {
            case "disponible":
                return <Bed className="h-6 w-6 text-green-600" />
            case "ocupada":
                return <Monitor className="h-6 w-6 text-red-600" />
            case "limpieza":
                return <Settings className="h-6 w-6 text-yellow-600" />
            case "mantenimiento":
                return <Wrench className="h-6 w-6 text-blue-600" />
            case "fuera_servicio":
                return <Zap className="h-6 w-6 text-gray-600" />
            default:
                return <Bed className="h-6 w-6 text-gray-600" />
        }
    }

    const getStatusText = (estado: string) => {
        switch (estado) {
            case "disponible":
                return "Disponible"
            case "ocupada":
                return "Ocupada"
            case "limpieza":
                return "En Limpieza"
            case "mantenimiento":
                return "Mantenimiento"
            case "fuera_servicio":
                return "Fuera de Servicio"
            default:
                return "Sin Estado"
        }
    }

    // Crear layout del shockroom (6 camas en disposición típica)
    const defaultLayout = [
        { position: { x: 1, y: 1 }, id: 1 },
        { position: { x: 3, y: 1 }, id: 2 },
        { position: { x: 5, y: 1 }, id: 3 },
        { position: { x: 1, y: 3 }, id: 4 },
        { position: { x: 3, y: 3 }, id: 5 },
        { position: { x: 5, y: 3 }, id: 6 },
    ]

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-red-600" />
                            Mapa del Shockroom
                        </CardTitle>
                        <CardDescription>
                            Distribución física de las camas críticas
                        </CardDescription>
                    </div>

                    {/* Leyenda */}
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                            <span>Disponible</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                            <span>Ocupada</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                            <span>Limpieza</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                            <span>Mantenimiento</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="h-full">
                <div className="relative h-full bg-gray-50 rounded-lg p-8">
                    {/* Grid del shockroom */}
                    <div className="grid grid-cols-6 grid-rows-4 gap-4 h-full">
                        {defaultLayout.map((layout) => {
                            // Buscar cama correspondiente o crear una por defecto
                            const cama = camas.find(c => c.numero_cama === `SR-${layout.id.toString().padStart(2, '0')}`) || {
                                id: `default-${layout.id}`,
                                numero_cama: `SR-${layout.id.toString().padStart(2, '0')}`,
                                estado: "disponible",
                                tipo_cama: "critica",
                                asignacion_actual: null,
                                paciente_nombre: null,
                                tiempo_ocupacion: null,
                                alertas_activas: []
                            }

                            const isSelected = selectedBed?.id === cama.id

                            return (
                                <div
                                    key={cama.id}
                                    className={`
                    col-start-${layout.position.x} 
                    row-start-${layout.position.y} 
                    col-span-1 
                    row-span-1
                  `}
                                >
                                    <div
                                        className={`
                      relative h-full min-h-[120px] rounded-lg border-2 cursor-pointer
                      transition-all duration-200 transform hover:scale-105
                      ${getBedColor(cama.estado)}
                      ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                    `}
                                        onClick={() => onBedClick(cama)}
                                    >
                                        {/* Número de cama */}
                                        <div className="absolute top-2 left-2 bg-white rounded px-2 py-1 text-xs font-semibold">
                                            {cama.numero_cama}
                                        </div>

                                        {/* Alertas */}
                                        {cama.alertas_activas && cama.alertas_activas.length > 0 && (
                                            <div className="absolute top-2 right-2">
                                                <div className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-pulse">
                                                    {cama.alertas_activas.length}
                                                </div>
                                            </div>
                                        )}

                                        {/* Contenido central */}
                                        <div className="flex flex-col items-center justify-center h-full p-2">
                                            {getBedIcon(cama.estado)}

                                            <div className="text-center mt-2">
                                                <p className="text-xs font-medium text-gray-700">
                                                    {getStatusText(cama.estado)}
                                                </p>

                                                {cama.paciente_nombre && (
                                                    <p className="text-xs text-gray-600 mt-1 truncate w-full">
                                                        {cama.paciente_nombre}
                                                    </p>
                                                )}

                                                {cama.tiempo_ocupacion && (
                                                    <div className="flex items-center justify-center mt-1 text-xs text-gray-500">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {Math.floor(cama.tiempo_ocupacion / 60)}h {cama.tiempo_ocupacion % 60}m
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Indicador de estado del paciente */}
                                        {cama.asignacion_actual && (
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <Badge
                                                    className={`
                            w-full text-xs py-0 px-1 
                            ${cama.asignacion_actual.estado_paciente === 'critico' ? 'bg-red-600' :
                                                            cama.asignacion_actual.estado_paciente === 'estable' ? 'bg-green-600' :
                                                                'bg-yellow-600'}
                          `}
                                                >
                                                    {cama.asignacion_actual.estado_paciente}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Entrada del Shockroom */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-600">
                            🚪 ENTRADA
                        </div>
                    </div>

                    {/* Estación de Enfermería */}
                    <div className="absolute top-4 right-4">
                        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 text-center">
                            <User className="h-6 w-6 mx-auto text-blue-600" />
                            <p className="text-xs mt-1 text-blue-700 font-medium">
                                Estación de<br />Enfermería
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información de la cama seleccionada */}
                {selectedBed && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">
                            {selectedBed.numero_cama} - {getStatusText(selectedBed.estado)}
                        </h4>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p><strong>Tipo:</strong> {selectedBed.tipo_cama}</p>
                                <p><strong>Estado:</strong> {getStatusText(selectedBed.estado)}</p>
                            </div>

                            {selectedBed.asignacion_actual && (
                                <div>
                                    <p><strong>Paciente:</strong> {selectedBed.paciente_nombre}</p>
                                    <p><strong>Médico:</strong> {selectedBed.asignacion_actual.medico_responsable}</p>
                                    {selectedBed.tiempo_ocupacion && (
                                        <p><strong>Tiempo:</strong> {Math.floor(selectedBed.tiempo_ocupacion / 60)}h {selectedBed.tiempo_ocupacion % 60}m</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedBed.alertas_activas && selectedBed.alertas_activas.length > 0 && (
                            <div className="mt-3">
                                <p className="font-medium text-red-700 mb-1">Alertas Activas:</p>
                                <div className="space-y-1">
                                    {selectedBed.alertas_activas.map((alerta: any) => (
                                        <div key={alerta.id} className="flex items-center text-xs text-red-600">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            {alerta.titulo}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 