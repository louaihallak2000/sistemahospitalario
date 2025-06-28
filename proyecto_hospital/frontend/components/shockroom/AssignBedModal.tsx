"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    Activity,
    AlertTriangle,
    Bed,
    Clock,
    User
} from "lucide-react"
import { useState } from "react"

interface AssignBedModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedBed: any
    candidatos: any[]
    onAssign: (camaId: string, episodioId: string) => void
}

export function AssignBedModal({
    open,
    onOpenChange,
    selectedBed,
    candidatos,
    onAssign
}: AssignBedModalProps) {
    const [selectedPatient, setSelectedPatient] = useState<string>("")
    const [observations, setObservations] = useState("")

    const getTriageColor = (color: string) => {
        switch (color) {
            case "ROJO":
                return "bg-red-600 text-white"
            case "NARANJA":
                return "bg-orange-500 text-white"
            default:
                return "bg-gray-500 text-white"
        }
    }

    const handleAssign = () => {
        if (selectedBed && selectedPatient) {
            onAssign(selectedBed.id, selectedPatient)
            setSelectedPatient("")
            setObservations("")
        }
    }

    const selectedPatientData = candidatos.find(p => p.episodio_id === selectedPatient)

    const resetForm = () => {
        setSelectedPatient("")
        setObservations("")
    }

    const handleClose = (open: boolean) => {
        if (!open) {
            resetForm()
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-red-600" />
                        Asignar Paciente a Shockroom
                    </DialogTitle>
                    <DialogDescription>
                        Asignar un paciente crítico a la cama {selectedBed?.numero_cama}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Información de la cama seleccionada */}
                    {selectedBed && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                                <Bed className="h-4 w-4 mr-2" />
                                Cama Seleccionada: {selectedBed.numero_cama}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p><strong>Tipo:</strong> {selectedBed.tipo_cama}</p>
                                    <p><strong>Estado:</strong> {selectedBed.estado}</p>
                                </div>
                                <div>
                                    {selectedBed.equipamiento && selectedBed.equipamiento.length > 0 && (
                                        <div>
                                            <p><strong>Equipamiento:</strong></p>
                                            <ul className="text-xs text-blue-700 mt-1">
                                                {selectedBed.equipamiento.map((equipo: string, index: number) => (
                                                    <li key={index}>• {equipo}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selector de paciente */}
                    <div>
                        <Label htmlFor="patient" className="text-base font-medium">
                            Seleccionar Paciente <span className="text-red-500">*</span>
                        </Label>
                        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Seleccionar paciente crítico" />
                            </SelectTrigger>
                            <SelectContent>
                                {candidatos.map((paciente) => (
                                    <SelectItem key={paciente.episodio_id} value={paciente.episodio_id}>
                                        <div className="flex items-center justify-between w-full">
                                            <div>
                                                <p className="font-medium">{paciente.paciente_nombre}</p>
                                                <p className="text-xs text-gray-500">
                                                    DNI: {paciente.paciente_dni} • {paciente.edad} años
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-4">
                                                <Badge className={getTriageColor(paciente.triaje_color)}>
                                                    {paciente.triaje_color}
                                                </Badge>
                                                {paciente.tiempo_espera && (
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {Math.floor(paciente.tiempo_espera / 60)}h {paciente.tiempo_espera % 60}m
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {candidatos.length === 0 && (
                            <p className="text-sm text-orange-600 mt-2 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                No hay pacientes candidatos disponibles
                            </p>
                        )}
                    </div>

                    {/* Información del paciente seleccionado */}
                    {selectedPatientData && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                Información del Paciente
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p><strong>Nombre:</strong> {selectedPatientData.paciente_nombre}</p>
                                    <p><strong>DNI:</strong> {selectedPatientData.paciente_dni}</p>
                                    <p><strong>Edad:</strong> {selectedPatientData.edad} años</p>
                                </div>
                                <div>
                                    <p><strong>Triaje:</strong>
                                        <Badge className={`ml-2 ${getTriageColor(selectedPatientData.triaje_color)}`}>
                                            {selectedPatientData.triaje_color}
                                        </Badge>
                                    </p>
                                    <p><strong>Tiempo de espera:</strong> {Math.floor((selectedPatientData.tiempo_espera || 0) / 60)}h {(selectedPatientData.tiempo_espera || 0) % 60}m</p>
                                </div>
                            </div>

                            {selectedPatientData.motivo_consulta && (
                                <div className="mt-3">
                                    <p><strong>Motivo de consulta:</strong></p>
                                    <p className="text-sm text-red-700 mt-1">{selectedPatientData.motivo_consulta}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Observaciones */}
                    <div>
                        <Label htmlFor="observations" className="text-base font-medium">
                            Observaciones de Ingreso
                        </Label>
                        <Textarea
                            id="observations"
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            placeholder="Observaciones adicionales sobre el ingreso al shockroom..."
                            rows={3}
                            className="mt-2"
                        />
                    </div>

                    {/* Información importante */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-800 mb-1">Información Importante</h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    <li>• El paciente será trasladado inmediatamente al shockroom</li>
                                    <li>• Se iniciará monitoreo continuo automáticamente</li>
                                    <li>• Notificar al equipo de enfermería del ingreso</li>
                                    <li>• Verificar equipamiento necesario según el caso</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleClose(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!selectedPatient}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        Asignar a Shockroom
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 