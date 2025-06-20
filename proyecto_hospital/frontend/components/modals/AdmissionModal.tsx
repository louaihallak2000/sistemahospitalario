"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useHospital } from "@/lib/context"
import { AlertTriangle, Building } from "lucide-react"

interface AdmissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdmissionModal({ open, onOpenChange }: AdmissionModalProps) {
  const { state, admitPatient } = useHospital()
  const [service, setService] = useState<string>("")
  const [room, setRoom] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [attendingPhysician, setAttendingPhysician] = useState("")
  const [observations, setObservations] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const patient = state.selectedPatient?.patient
  const episode = state.selectedPatient?.episode

  const getAge = (birthDate?: string) => {
    if (!birthDate) return "N/A"
    const today = new Date()
    const birth = new Date(birthDate)
    return today.getFullYear() - birth.getFullYear()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!episode || !service || !diagnosis) return

    console.log("🏥 INICIANDO internación para:", patient?.firstName, patient?.lastName)

    setIsSubmitting(true)
    try {
      const admissionData = {
        service: service,
        room: room.trim() || "Por asignar",
        diagnosis: diagnosis.trim(),
        attendingPhysician: attendingPhysician.trim() || state.user?.username || "Por asignar",
        observations: observations.trim(),
      }

      console.log("📄 Datos de internación:", admissionData)

      await admitPatient(episode.id, admissionData)

      console.log("✅ Internación procesada exitosamente")
      
      // 🎯 El contexto maneja automáticamente la navegación al dashboard
      console.log("🔄 Navegación automática al dashboard activada...")
      
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("❌ Error al procesar internación:", error)
      alert("Error al procesar la internación. Por favor, intente nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setService("")
    setRoom("")
    setDiagnosis("")
    setAttendingPhysician("")
    setObservations("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>Internar Paciente</span>
          </DialogTitle>
          <DialogDescription>
            Completar los datos para internar a: <strong>{patient?.firstName} {patient?.lastName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Paciente */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-700">Información del Paciente</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Nombre:</strong> {patient?.firstName} {patient?.lastName}</div>
                <div><strong>DNI:</strong> {patient?.dni}</div>
                <div><strong>Edad:</strong> {getAge(patient?.birthDate)} años</div>
                <div><strong>Obra Social:</strong> {patient?.insurance || "Sin cobertura"}</div>
              </div>
              
              {patient?.allergies && patient.allergies.length > 0 && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <strong className="text-red-800">Alergias:</strong> {patient.allergies.join(", ")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Servicio de Internación */}
          <div>
            <Label htmlFor="service" className="text-base font-medium">
              Servicio de Internación <span className="text-red-500">*</span>
            </Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medicina-interna">Medicina Interna</SelectItem>
                <SelectItem value="cirugia-general">Cirugía General</SelectItem>
                <SelectItem value="traumatologia">Traumatología</SelectItem>
                <SelectItem value="cardiologia">Cardiología</SelectItem>
                <SelectItem value="neurologia">Neurología</SelectItem>
                <SelectItem value="uti">Unidad de Terapia Intensiva</SelectItem>
                <SelectItem value="pediatria">Pediatría</SelectItem>
                <SelectItem value="ginecologia">Ginecología</SelectItem>
                <SelectItem value="psiquiatria">Psiquiatría</SelectItem>
                <SelectItem value="oncologia">Oncología</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cama/Habitación */}
          <div>
            <Label htmlFor="room" className="text-base font-medium">
              Cama/Habitación
            </Label>
            <Input
              id="room"
              placeholder="Ej: Hab 205, Cama 1 / Sala 3, Cama 15"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Si no se especifica, se asignará "Por asignar"
            </p>
          </div>

          {/* Diagnóstico de Internación */}
          <div>
            <Label htmlFor="diagnosis" className="text-base font-medium">
              Diagnóstico de Internación <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="diagnosis"
              placeholder="Diagnóstico que justifica la internación..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={3}
              className="mt-2"
              required
            />
          </div>

          {/* Médico Responsable */}
          <div>
            <Label htmlFor="attendingPhysician" className="text-base font-medium">
              Médico Responsable
            </Label>
            <Input
              id="attendingPhysician"
              placeholder="Nombre del médico responsable"
              value={attendingPhysician}
              onChange={(e) => setAttendingPhysician(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Si no se especifica, se asignará el médico actual: {state.user?.username}
            </p>
          </div>

          {/* Observaciones */}
          <div>
            <Label htmlFor="observations" className="text-base font-medium">
              Observaciones
            </Label>
            <Textarea
              id="observations"
              placeholder="Indicaciones especiales, restricciones, etc..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Vista Previa de la Internación */}
          {service && diagnosis && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-700">Vista Previa de la Internación</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                <div className="space-y-2">
                  <p><strong>Servicio:</strong> {
                    service === 'medicina-interna' ? 'Medicina Interna' :
                    service === 'cirugia-general' ? 'Cirugía General' :
                    service === 'traumatologia' ? 'Traumatología' :
                    service === 'cardiologia' ? 'Cardiología' :
                    service === 'neurologia' ? 'Neurología' :
                    service === 'uti' ? 'Unidad de Terapia Intensiva' :
                    service === 'pediatria' ? 'Pediatría' :
                    service === 'ginecologia' ? 'Ginecología' :
                    service === 'psiquiatria' ? 'Psiquiatría' :
                    service === 'oncologia' ? 'Oncología' : service
                  }</p>
                  <p><strong>Ubicación:</strong> {room || "Por asignar"}</p>
                  <p><strong>Diagnóstico:</strong> {diagnosis}</p>
                  <p><strong>Médico Responsable:</strong> {attendingPhysician || state.user?.username || "Por asignar"}</p>
                  {observations && <p><strong>Observaciones:</strong> {observations}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!service || !diagnosis || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Confirmar Internación</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 