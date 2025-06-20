"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Search, AlertTriangle, Check, X } from "lucide-react"
import { useHospital } from "@/lib/context"

interface PrescriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mockMedications = [
  { id: "1", name: "Ibuprofeno 400mg", stock: 120, contraindications: [] },
  { id: "2", name: "Ibuprofeno 600mg", stock: 85, contraindications: [] },
  { id: "3", name: "Omeprazol 20mg", stock: 200, contraindications: [] },
  { id: "4", name: "Omeprazol 40mg", stock: 150, contraindications: [] },
  { id: "5", name: "Amoxicilina 500mg", stock: 0, contraindications: ["penicilina"] },
  { id: "6", name: "Paracetamol 500mg", stock: 300, contraindications: [] },
]

export function PrescriptionModal({ open, onOpenChange }: PrescriptionModalProps) {
  const { state, addPrescription } = useHospital()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMedication, setSelectedMedication] = useState<any>(null)
  const [formData, setFormData] = useState({
    dose: "",
    frequency: "",
    route: "Oral",
    duration: "",
    instructions: "",
  })

  const patient = state.selectedPatient?.patient
  const episode = state.selectedPatient?.episode

  const filteredMedications = mockMedications.filter((med) => med.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const hasAllergy = (medication: any) => {
    if (!patient?.allergies) return false
    return medication.contraindications.some((contra: string) =>
      patient.allergies?.some((allergy) => allergy.toLowerCase().includes(contra.toLowerCase())),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedication || !episode) return

    const prescription = {
      medication: selectedMedication.name,
      dose: formData.dose,
      frequency: formData.frequency,
      route: formData.route,
      duration: formData.duration,
      instructions: formData.instructions,
    }

    await addPrescription(episode.id, prescription)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setSearchTerm("")
    setSelectedMedication(null)
    setFormData({
      dose: "",
      frequency: "",
      route: "Oral",
      duration: "",
      instructions: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prescribir Medicamento</DialogTitle>
          <DialogDescription>
            Paciente: {patient?.firstName} {patient?.lastName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medication Search */}
          <div className="space-y-2">
            <Label>Buscar Medicamento</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar medicamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {filteredMedications.map((med) => (
                  <div
                    key={med.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                      selectedMedication?.id === med.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedMedication(med)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{med.name}</span>
                      <div className="flex items-center space-x-2">
                        {med.stock > 0 ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Stock: {med.stock}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <X className="h-3 w-3 mr-1" />
                            Sin stock
                          </Badge>
                        )}
                        {hasAllergy(med) && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Alergia
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedMedication && (
            <>
              {/* Allergy Warning */}
              {hasAllergy(selectedMedication) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ ADVERTENCIA: El paciente es alérgico a componentes de este medicamento
                  </AlertDescription>
                </Alert>
              )}

              {/* Stock Warning */}
              {selectedMedication.stock === 0 && (
                <Alert variant="destructive">
                  <AlertDescription>❌ Medicamento sin stock disponible</AlertDescription>
                </Alert>
              )}

              {/* Prescription Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dose">Dosis</Label>
                  <Input
                    id="dose"
                    placeholder="1 comprimido"
                    value={formData.dose}
                    onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Frecuencia</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cada 4 horas">Cada 4 horas</SelectItem>
                      <SelectItem value="cada 6 horas">Cada 6 horas</SelectItem>
                      <SelectItem value="cada 8 horas">Cada 8 horas</SelectItem>
                      <SelectItem value="cada 12 horas">Cada 12 horas</SelectItem>
                      <SelectItem value="cada 24 horas">Cada 24 horas</SelectItem>
                      <SelectItem value="según necesidad">Según necesidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="route">Vía de Administración</Label>
                  <Select value={formData.route} onValueChange={(value) => setFormData({ ...formData, route: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oral">Oral</SelectItem>
                      <SelectItem value="Intravenosa">Intravenosa</SelectItem>
                      <SelectItem value="Intramuscular">Intramuscular</SelectItem>
                      <SelectItem value="Subcutánea">Subcutánea</SelectItem>
                      <SelectItem value="Tópica">Tópica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duración</Label>
                  <Input
                    id="duration"
                    placeholder="3 días"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instructions">Indicaciones Adicionales</Label>
                <Textarea
                  id="instructions"
                  placeholder="Tomar con las comidas..."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Active Prescriptions */}
          <div>
            <Label className="text-sm font-medium">Prescripciones Activas del Episodio</Label>
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
              {episode?.prescriptions
                ?.filter((p) => p.status === "active")
                .map((prescription) => (
                  <div key={prescription.id} className="text-sm p-2 bg-gray-50 rounded">
                    {prescription.medication} - {prescription.dose} - {prescription.frequency}
                  </div>
                )) || <p className="text-sm text-gray-500">No hay prescripciones activas</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedMedication || selectedMedication.stock === 0 || hasAllergy(selectedMedication)}
            >
              Prescribir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
