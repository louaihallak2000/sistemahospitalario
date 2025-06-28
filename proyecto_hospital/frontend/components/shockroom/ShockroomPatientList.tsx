"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Bed,
    Clock,
    User,
    Users
} from "lucide-react"
import { useState } from "react"

interface ShockroomPatientListProps {
    pacientes: any[]
    camasDisponibles: any[]
    onAssignBed: (camaId: string, episodioId: string) => void
}

export function ShockroomPatientList({ pacientes, camasDisponibles, onAssignBed }: ShockroomPatientListProps) {
    const [selectedPatient, setSelectedPatient] = useState<any>(null)
    const [selectedBed, setSelectedBed] = useState<string>("")

    const getTriageColor = (color: string) => {
        switch (color) {
            case "ROJO":
                return "bg-red-600 text-white"
            case "NARANJA":
                return "bg-orange-500 text-white"
            case "AMARILLO":
                return "bg-yellow-500 text-white"
            case "VERDE":
                return "bg-green-600 text-white"
            case "AZUL":
                return "bg-blue-600 text-white"
            default:
                return "bg-gray-500 text-white"
        }
    }

    const getUrgencyLevel = (triageColor: string, tiempoEspera: number) => {
        if (triageColor === "ROJO" && tiempoEspera > 15) return "CRÍTICO"
        if (triageColor === "NARANJA" && tiempoEspera > 30) return "URGENTE"
        if (tiempoEspera > 60) return "MODERADO"
        return "NORMAL"
    }

    const getUrgencyBadge = (level: string) => {
        switch (level) {
            case "CRÍTICO":
                return "bg-red-600 text-white animate-pulse"
            case "URGENTE":
                return "bg-orange-600 text-white"
            case "MODERADO":
                return "bg-yellow-600 text-white"
            default:
                return "bg-green-600 text-white"
        }
    }

    const handleAssign = () => {
        if (selectedPatient && selectedBed) {
            onAssignBed(selectedBed, selectedPatient.episodio_id)
            setSelectedPatient(null)
            setSelectedBed("")
        }
    }

    const sortedPatients = [...pacientes].sort((a, b) => {
        // Priorizar por color de triaje (ROJO > NARANJA)
        const triageOrder = { "ROJO": 0, "NARANJA": 1, "AMARILLO": 2, "VERDE": 3, "AZUL": 4 }
        const aOrder = triageOrder[a.triaje_color as keyof typeof triageOrder] ?? 5
        const bOrder = triageOrder[b.triaje_color as keyof typeof triageOrder] ?? 5

        if (aOrder !== bOrder) return aOrder - bOrder

        // Si mismo triaje, priorizar por tiempo de espera
        return (b.tiempo_espera || 0) - (a.tiempo_espera || 0)
    })

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Lista de pacientes candidatos */}
            <div className="lg:col-span-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Users className="h-5 w-5 mr-2 text-red-600" />
                            Pacientes Candidatos ({pacientes.length})
                        </CardTitle>
                        <CardDescription>
                            Pacientes con triaje ROJO/NARANJA elegibles para shockroom
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[600px]">
                            <div className="space-y-3 p-6">
                                {sortedPatients.map((paciente) => {
                                    const urgencyLevel = getUrgencyLevel(paciente.triaje_color, paciente.tiempo_espera)
                                    const isSelected = selectedPatient?.episodio_id === paciente.episodio_id

                                    return (
                                        <div
                                            key={paciente.episodio_id}
                                            className={`
                        p-4 border rounded-lg cursor-pointer transition-all duration-200
                        ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm'
                                                }
                      `}
                                            onClick={() => setSelectedPatient(paciente)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    {/* Información del paciente */}
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <User className="h-4 w-4 text-gray-500" />
                                                            <h3 className="font-semibold text-gray-900">
                                                                {paciente.paciente_nombre}
                                                            </h3>
                                                        </div>
                                                        {paciente.edad && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {paciente.edad} años
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-2">
                                                        DNI: {paciente.paciente_dni}
                                                    </p>

                                                    {paciente.motivo_consulta && (
                                                        <p className="text-sm text-gray-700 mb-3">
                                                            <strong>Motivo:</strong> {paciente.motivo_consulta}
                                                        </p>
                                                    )}

                                                    {/* Tiempo de espera */}
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span>
                                                            Esperando {Math.floor((paciente.tiempo_espera || 0) / 60)}h {(paciente.tiempo_espera || 0) % 60}m
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Badges de estado */}
                                                <div className="flex flex-col items-end space-y-2">
                                                    <Badge className={getTriageColor(paciente.triaje_color)}>
                                                        {paciente.triaje_color}
                                                    </Badge>

                                                    <Badge className={getUrgencyBadge(urgencyLevel)}>
                                                        {urgencyLevel}
                                                    </Badge>

                                                    {isSelected && (
                                                        <div className="flex items-center text-blue-600 text-sm font-medium">
                                                            <Activity className="h-3 w-3 mr-1" />
                                                            SELECCIONADO
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {pacientes.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">No hay pacientes candidatos</p>
                                        <p className="text-sm">
                                            Los pacientes con triaje ROJO/NARANJA aparecerán aquí
                                        </p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Panel de asignación */}
            <div className="lg:col-span-1">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Bed className="h-5 w-5 mr-2 text-blue-600" />
                            Asignar a Shockroom
                        </CardTitle>
                        <CardDescription>
                            Seleccione paciente y cama disponible
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Paciente seleccionado */}
                        {selectedPatient ? (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="font-medium text-blue-900 mb-1">Paciente Seleccionado:</p>
                                <p className="text-sm text-blue-800">{selectedPatient.paciente_nombre}</p>
                                <p className="text-xs text-blue-600">DNI: {selectedPatient.paciente_dni}</p>
                                <Badge className={`mt-2 ${getTriageColor(selectedPatient.triaje_color)}`}>
                                    {selectedPatient.triaje_color}
                                </Badge>
                            </div>
                        ) : (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                <p className="text-sm text-gray-600">Seleccione un paciente de la lista</p>
                            </div>
                        )}

                        {/* Selector de cama */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cama Disponible:
                            </label>
                            <Select value={selectedBed} onValueChange={setSelectedBed}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar cama" />
                                </SelectTrigger>
                                <SelectContent>
                                    {camasDisponibles.map((cama) => (
                                        <SelectItem key={cama.id} value={cama.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{cama.numero_cama}</span>
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {cama.tipo_cama}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {camasDisponibles.length === 0 && (
                                <p className="text-sm text-orange-600 mt-2 flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    No hay camas disponibles
                                </p>
                            )}
                        </div>

                        {/* Botón de asignación */}
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedPatient || !selectedBed}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Asignar a Shockroom
                        </Button>

                        {/* Información de camas disponibles */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Estado de Camas:</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <Bed className="h-4 w-4 mr-2 text-green-600" />
                                        <span>Disponibles</span>
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                        {camasDisponibles.length}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Instrucciones */}
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800">
                                <strong>Instrucciones:</strong><br />
                                1. Seleccione un paciente de la lista<br />
                                2. Elija una cama disponible<br />
                                3. Confirme la asignación
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 