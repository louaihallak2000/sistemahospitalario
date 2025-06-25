"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useHospital } from "@/lib/context"
import { AlertCircle, Clock, Stethoscope, User } from "lucide-react"
import { useState } from "react"

interface ProcedureModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Lista de procedimientos comunes
const commonProcedures = [
    { id: "curacion", name: "Curación de heridas", category: "Cuidados básicos" },
    { id: "vendaje", name: "Vendaje/Apósito", category: "Cuidados básicos" },
    { id: "nebulizacion", name: "Nebulización", category: "Respiratorio" },
    { id: "aspiracion", name: "Aspiración de secreciones", category: "Respiratorio" },
    { id: "cateter", name: "Colocación de catéter", category: "Procedimientos" },
    { id: "sonda", name: "Colocación de sonda", category: "Procedimientos" },
    { id: "signos-vitales", name: "Control de signos vitales", category: "Monitoreo" },
    { id: "glicemia", name: "Control de glicemia", category: "Monitoreo" },
    { id: "medicacion-iv", name: "Administración IV", category: "Medicación" },
    { id: "medicacion-im", name: "Administración IM", category: "Medicación" },
    { id: "oxigenoterapia", name: "Oxigenoterapia", category: "Respiratorio" },
    { id: "otro", name: "Otro procedimiento", category: "Otros" },
]

const priorityOptions = [
    { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-800" },
    { value: "urgente", label: "Urgente", color: "bg-orange-100 text-orange-800" },
    { value: "inmediato", label: "Inmediato", color: "bg-red-100 text-red-800" },
]

export function ProcedureModal({ open, onOpenChange }: ProcedureModalProps) {
    const { state, addProcedureIndication } = useHospital()
    const [selectedProcedure, setSelectedProcedure] = useState("")
    const [customProcedure, setCustomProcedure] = useState("")
    const [description, setDescription] = useState("")
    const [instructions, setInstructions] = useState("")
    const [priority, setPriority] = useState<"normal" | "urgente" | "inmediato">("normal")
    const [frequency, setFrequency] = useState("")
    const [duration, setDuration] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const patient = state.selectedPatient?.patient
    const episode = state.selectedPatient?.episode

    const resetForm = () => {
        setSelectedProcedure("")
        setCustomProcedure("")
        setDescription("")
        setInstructions("")
        setPriority("normal")
        setFrequency("")
        setDuration("")
        setErrors({})
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!selectedProcedure) {
            newErrors.procedure = "Debe seleccionar un procedimiento"
        }

        if (selectedProcedure === "otro" && !customProcedure.trim()) {
            newErrors.customProcedure = "Debe especificar el procedimiento"
        }

        if (!description.trim()) {
            newErrors.description = "Debe agregar una descripción"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm() || !episode) return

        setIsSubmitting(true)
        try {
            const procedureName = selectedProcedure === "otro"
                ? customProcedure
                : commonProcedures.find(p => p.id === selectedProcedure)?.name || selectedProcedure

            const procedureData = {
                procedure: procedureName,
                category: selectedProcedure === "otro"
                    ? "Otros"
                    : commonProcedures.find(p => p.id === selectedProcedure)?.category || "Otros",
                description: description.trim(),
                instructions: instructions.trim(),
                priority,
                frequency: frequency.trim(),
                duration: duration.trim(),
                status: "pending" as const,
                orderedBy: state.user?.username || "Médico",
                orderedAt: new Date().toISOString(),
            }

            console.log("🏥 Enviando indicación de procedimiento:", procedureData)

            await addProcedureIndication(episode.id, procedureData)

            console.log("✅ Indicación de procedimiento agregada exitosamente")
            onOpenChange(false)
            resetForm()
        } catch (error) {
            console.error("❌ Error al agregar indicación de procedimiento:", error)
            alert("Error al agregar la indicación. Por favor, intente nuevamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getAge = (birthDate?: string) => {
        if (!birthDate) return "N/A"
        const today = new Date()
        const birth = new Date(birthDate)
        return today.getFullYear() - birth.getFullYear()
    }

    const selectedPriorityOption = priorityOptions.find(opt => opt.value === priority)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-lg">
                        <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                        Indicación de Procedimiento
                    </DialogTitle>
                </DialogHeader>

                {/* Información del Paciente */}
                {patient && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <User className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="font-semibold text-blue-900">
                                            {patient.lastName}, {patient.firstName}
                                        </p>
                                        <p className="text-sm text-blue-700">
                                            {getAge(patient.birthDate)} años • DNI: {patient.dni}
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Selección de Procedimiento */}
                    <div>
                        <Label htmlFor="procedure" className="text-base font-medium">
                            Tipo de Procedimiento <span className="text-red-500">*</span>
                        </Label>
                        <Select value={selectedProcedure} onValueChange={setSelectedProcedure}>
                            <SelectTrigger className={`mt-2 ${errors.procedure ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Seleccionar procedimiento" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(
                                    commonProcedures.reduce((acc, proc) => {
                                        if (!acc[proc.category]) acc[proc.category] = []
                                        acc[proc.category].push(proc)
                                        return acc
                                    }, {} as Record<string, typeof commonProcedures>)
                                ).map(([category, procedures]) => (
                                    <div key={category}>
                                        <div className="px-2 py-1 text-sm font-semibold text-gray-600 bg-gray-100">
                                            {category}
                                        </div>
                                        {procedures.map((procedure) => (
                                            <SelectItem key={procedure.id} value={procedure.id}>
                                                {procedure.name}
                                            </SelectItem>
                                        ))}
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.procedure && <p className="text-sm text-red-500 mt-1">{errors.procedure}</p>}
                    </div>

                    {/* Procedimiento Personalizado */}
                    {selectedProcedure === "otro" && (
                        <div>
                            <Label htmlFor="customProcedure" className="text-base font-medium">
                                Especificar Procedimiento <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="customProcedure"
                                value={customProcedure}
                                onChange={(e) => setCustomProcedure(e.target.value)}
                                placeholder="Nombre del procedimiento..."
                                className={`mt-2 ${errors.customProcedure ? 'border-red-500' : ''}`}
                            />
                            {errors.customProcedure && <p className="text-sm text-red-500 mt-1">{errors.customProcedure}</p>}
                        </div>
                    )}

                    {/* Descripción */}
                    <div>
                        <Label htmlFor="description" className="text-base font-medium">
                            Descripción del Procedimiento <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describa qué debe realizarse, objetivos del procedimiento..."
                            rows={3}
                            className={`mt-2 ${errors.description ? 'border-red-500' : ''}`}
                        />
                        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                    </div>

                    {/* Instrucciones Específicas */}
                    <div>
                        <Label htmlFor="instructions" className="text-base font-medium">
                            Instrucciones Específicas
                        </Label>
                        <Textarea
                            id="instructions"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Técnica específica, precauciones, materiales necesarios..."
                            rows={3}
                            className="mt-2"
                        />
                    </div>

                    {/* Configuración */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Prioridad */}
                        <div>
                            <Label htmlFor="priority" className="text-base font-medium">
                                Prioridad
                            </Label>
                            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorityOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-2 ${option.color}`}></div>
                                                {option.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Frecuencia */}
                        <div>
                            <Label htmlFor="frequency" className="text-base font-medium">
                                Frecuencia
                            </Label>
                            <Input
                                id="frequency"
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                placeholder="Ej: c/8hs, 2 veces/día"
                                className="mt-2"
                            />
                        </div>

                        {/* Duración */}
                        <div>
                            <Label htmlFor="duration" className="text-base font-medium">
                                Duración
                            </Label>
                            <Input
                                id="duration"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="Ej: 3 días, hasta alta"
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {/* Preview de la Indicación */}
                    {selectedProcedure && description && (
                        <Card className="bg-green-50 border-green-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-green-700 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Vista Previa de la Indicación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm">
                                <div className="space-y-2">
                                    <p><strong>Procedimiento:</strong> {
                                        selectedProcedure === "otro"
                                            ? customProcedure
                                            : commonProcedures.find(p => p.id === selectedProcedure)?.name
                                    }</p>
                                    <p><strong>Descripción:</strong> {description}</p>
                                    {instructions && <p><strong>Instrucciones:</strong> {instructions}</p>}
                                    <div className="flex items-center space-x-4">
                                        <Badge className={selectedPriorityOption?.color}>
                                            {selectedPriorityOption?.label}
                                        </Badge>
                                        {frequency && <span><strong>Frecuencia:</strong> {frequency}</span>}
                                        {duration && <span><strong>Duración:</strong> {duration}</span>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </form>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isSubmitting ? "Guardando..." : "Crear Indicación"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 