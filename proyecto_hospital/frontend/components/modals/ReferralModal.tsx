"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Send, Printer } from "lucide-react"
import { useHospital } from "@/lib/context"

interface ReferralModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const hospitals = [
  { id: "1", name: "Hospital Italiano", type: "virtual" },
  { id: "2", name: "Hospital Alemán", type: "virtual" },
  { id: "3", name: "Clínica Santa Isabel", type: "paper" },
  { id: "4", name: "Hospital Municipal", type: "paper" },
]

const specialties = [
  "Cardiología",
  "Traumatología",
  "Neurología",
  "Gastroenterología",
  "Endocrinología",
  "Dermatología",
  "Oftalmología",
  "Otorrinolaringología",
  "Urología",
  "Ginecología",
]

export function ReferralModal({ open, onOpenChange }: ReferralModalProps) {
  const { state, createReferral } = useHospital()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHospital, setSelectedHospital] = useState<any>(null)
  const [referralType, setReferralType] = useState<"virtual" | "paper">("virtual")
  const [formData, setFormData] = useState({
    specialty: "",
    diagnosis: "",
    clinicalSummary: "",
    attachedStudies: [] as string[],
  })

  const patient = state.selectedPatient?.patient
  const episode = state.selectedPatient?.episode

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const availableStudies = ["ECG", "Laboratorio", "Radiografía", "Ecografía", "TAC", "Resonancia"]

  const handleStudyChange = (study: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, attachedStudies: [...formData.attachedStudies, study] })
    } else {
      setFormData({ ...formData, attachedStudies: formData.attachedStudies.filter((s) => s !== study) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHospital || !episode) return

    const referral = {
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      type: referralType,
      specialty: formData.specialty,
      diagnosis: formData.diagnosis,
      clinicalSummary: formData.clinicalSummary,
      attachedStudies: formData.attachedStudies,
    }

    await createReferral(episode.id, referral)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setSearchTerm("")
    setSelectedHospital(null)
    setReferralType("virtual")
    setFormData({
      specialty: "",
      diagnosis: "",
      clinicalSummary: "",
      attachedStudies: [],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Derivación de Paciente</DialogTitle>
          <DialogDescription>
            Paciente: {patient?.firstName} {patient?.lastName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hospital Search */}
          <div className="space-y-2">
            <Label>Hospital Destino</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {filteredHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                      selectedHospital?.id === hospital.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      setSelectedHospital(hospital)
                      setReferralType(hospital.type as "virtual" | "paper")
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{hospital.name}</span>
                      <span className="text-sm text-gray-500 capitalize">{hospital.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedHospital && (
            <>
              {/* Referral Type */}
              <div>
                <Label className="text-base font-medium">Tipo de Derivación</Label>
                <RadioGroup
                  value={referralType}
                  onValueChange={(value: any) => setReferralType(value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="virtual" id="virtual" />
                    <Label htmlFor="virtual">Virtual (hospital conectado)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paper" id="paper" />
                    <Label htmlFor="paper">Papel (imprimir hoja)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Specialty */}
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Diagnosis */}
              <div>
                <Label htmlFor="diagnosis">Diagnóstico</Label>
                <Input
                  id="diagnosis"
                  placeholder="Ej: Infarto agudo de miocardio"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                />
              </div>

              {/* Clinical Summary */}
              <div>
                <Label htmlFor="clinicalSummary">Resumen Clínico</Label>
                <Textarea
                  id="clinicalSummary"
                  placeholder="Descripción detallada del caso, evolución, tratamientos realizados..."
                  value={formData.clinicalSummary}
                  onChange={(e) => setFormData({ ...formData, clinicalSummary: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {/* Attached Studies */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estudios Adjuntos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {availableStudies.map((study) => (
                      <div key={study} className="flex items-center space-x-2">
                        <Checkbox
                          id={study}
                          checked={formData.attachedStudies.includes(study)}
                          onCheckedChange={(checked) => handleStudyChange(study, checked as boolean)}
                        />
                        <Label htmlFor={study} className="text-sm cursor-pointer">
                          {study}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vista Previa de Derivación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Hospital:</strong> {selectedHospital.name}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {referralType === "virtual" ? "Virtual" : "Papel"}
                  </p>
                  <p>
                    <strong>Especialidad:</strong> {formData.specialty}
                  </p>
                  <p>
                    <strong>Diagnóstico:</strong> {formData.diagnosis}
                  </p>
                  {formData.attachedStudies.length > 0 && (
                    <p>
                      <strong>Estudios adjuntos:</strong> {formData.attachedStudies.join(", ")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {referralType === "virtual" ? (
              <Button type="submit" disabled={!selectedHospital}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Derivación
              </Button>
            ) : (
              <Button type="submit" disabled={!selectedHospital}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir y Enviar
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
