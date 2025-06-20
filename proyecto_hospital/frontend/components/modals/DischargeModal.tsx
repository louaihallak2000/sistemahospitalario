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
import { AlertTriangle, UserCheck } from "lucide-react"

interface DischargeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DischargeModal({ open, onOpenChange }: DischargeModalProps) {
  const { state, dischargePatient } = useHospital()
  const [dischargeType, setDischargeType] = useState<string>("")
  const [diagnosis, setDiagnosis] = useState("")
  const [instructions, setInstructions] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
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
    if (!episode || !dischargeType || !diagnosis) return

    console.log("🏥 INICIANDO alta médica para:", patient?.firstName, patient?.lastName)

    setIsSubmitting(true)
    try {
      const dischargeData = {
        type: dischargeType,
        diagnosis: diagnosis.trim(),
        instructions: instructions.trim(),
        followUpDate: followUpDate || null,
        observations: observations.trim(),
      }

      console.log("📄 Datos de alta:", dischargeData)

      await dischargePatient(episode.id, dischargeData)

      console.log("✅ Alta médica procesada exitosamente")
      
      // 🎯 El contexto maneja automáticamente la navegación al dashboard
      console.log("🔄 Navegación automática al dashboard activada...")
      
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("❌ Error al procesar alta médica:", error)
      alert("Error al procesar el alta médica. Por favor, intente nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setDischargeType("")
    setDiagnosis("")
    setInstructions("")
    setFollowUpDate("")
    setObservations("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            <span>Alta Médica</span>
          </DialogTitle>
          <DialogDescription>
            Completar los datos para dar de alta a: <strong>{patient?.firstName} {patient?.lastName}</strong>
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

          {/* Tipo de Alta */}
          <div>
            <Label htmlFor="dischargeType" className="text-base font-medium">
              Tipo de Alta <span className="text-red-500">*</span>
            </Label>
            <Select value={dischargeType} onValueChange={setDischargeType}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Seleccionar tipo de alta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical">Alta Médica</SelectItem>
                <SelectItem value="voluntary">Alta Voluntaria</SelectItem>
                <SelectItem value="transfer">Derivación a otro Centro</SelectItem>
                <SelectItem value="escape">Fuga</SelectItem>
                <SelectItem value="death">Óbito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Diagnóstico de Egreso */}
          <div>
            <Label htmlFor="diagnosis" className="text-base font-medium">
              Diagnóstico de Egreso <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="diagnosis"
              placeholder="Diagnóstico principal y secundarios..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={3}
              className="mt-2"
              required
            />
          </div>

          {/* Indicaciones Post-Alta */}
          <div>
            <Label htmlFor="instructions" className="text-base font-medium">
              Indicaciones Post-Alta
            </Label>
            <Textarea
              id="instructions"
              placeholder="Medicación, cuidados, restricciones, etc..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Próxima Consulta */}
          <div>
            <Label htmlFor="followUpDate" className="text-base font-medium">
              Próxima Consulta
            </Label>
            <Input
              id="followUpDate"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="mt-2"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Observaciones */}
          <div>
            <Label htmlFor="observations" className="text-base font-medium">
              Observaciones Adicionales
            </Label>
            <Textarea
              id="observations"
              placeholder="Observaciones generales..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Vista Previa del Alta */}
          {dischargeType && diagnosis && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-700">Vista Previa del Alta</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                <div className="space-y-2">
                  <p><strong>Tipo:</strong> {
                    dischargeType === 'medical' ? 'Alta Médica' :
                    dischargeType === 'voluntary' ? 'Alta Voluntaria' :
                    dischargeType === 'transfer' ? 'Derivación' :
                    dischargeType === 'escape' ? 'Fuga' : 'Óbito'
                  }</p>
                  <p><strong>Diagnóstico:</strong> {diagnosis}</p>
                  {instructions && <p><strong>Indicaciones:</strong> {instructions}</p>}
                  {followUpDate && <p><strong>Próxima Consulta:</strong> {new Date(followUpDate).toLocaleDateString()}</p>}
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
              disabled={!dischargeType || !diagnosis || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Confirmar Alta</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 