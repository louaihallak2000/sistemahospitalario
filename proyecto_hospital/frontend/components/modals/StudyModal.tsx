"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useHospital } from "@/lib/context"

interface StudyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const laboratoryStudies = [
  { id: "hemograma", name: "Hemograma completo", checked: false },
  { id: "glucemia", name: "Glucemia en ayunas", checked: false },
  { id: "lipidos", name: "Perfil lipídico", checked: false },
  { id: "renal", name: "Función renal", checked: false },
  { id: "hepaticas", name: "Enzimas hepáticas", checked: false },
  { id: "electrolitos", name: "Electrolitos", checked: false },
]

const imagingStudies = [
  { id: "rx-torax", name: "Radiografía de tórax", checked: false },
  { id: "eco-abdominal", name: "Ecografía abdominal", checked: false },
  { id: "tac-abdomen", name: "TAC de abdomen", checked: false },
  { id: "rx-huesos", name: "Radiografía ósea", checked: false },
  { id: "eco-cardiaca", name: "Ecocardiograma", checked: false },
]

export function StudyModal({ open, onOpenChange }: StudyModalProps) {
  const { state, addStudyOrder } = useHospital()
  const [selectedLab, setSelectedLab] = useState<string[]>([])
  const [selectedImaging, setSelectedImaging] = useState<string[]>([])
  const [priority, setPriority] = useState<"normal" | "urgent" | "emergency">("normal")
  const [observations, setObservations] = useState("")

  const patient = state.selectedPatient?.patient
  const episode = state.selectedPatient?.episode

  const handleLabChange = (studyId: string, checked: boolean) => {
    if (checked) {
      setSelectedLab([...selectedLab, studyId])
    } else {
      setSelectedLab(selectedLab.filter((id) => id !== studyId))
    }
  }

  const handleImagingChange = (studyId: string, checked: boolean) => {
    if (checked) {
      setSelectedImaging([...selectedImaging, studyId])
    } else {
      setSelectedImaging(selectedImaging.filter((id) => id !== studyId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!episode) return

    const allSelectedStudies = [
      ...selectedLab.map((id) => ({
        id,
        name: laboratoryStudies.find((s) => s.id === id)?.name || "",
        type: "laboratory" as const,
      })),
      ...selectedImaging.map((id) => ({
        id,
        name: imagingStudies.find((s) => s.id === id)?.name || "",
        type: "imaging" as const,
      })),
    ]

    for (const study of allSelectedStudies) {
      await addStudyOrder(episode.id, {
        name: study.name,
        type: study.type,
        priority,
        observations,
      })
    }

    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setSelectedLab([])
    setSelectedImaging([])
    setPriority("normal")
    setObservations("")
  }

  const getSelectedStudiesPreview = () => {
    const labNames = selectedLab.map((id) => laboratoryStudies.find((s) => s.id === id)?.name).filter(Boolean)
    const imagingNames = selectedImaging.map((id) => imagingStudies.find((s) => s.id === id)?.name).filter(Boolean)
    return [...labNames, ...imagingNames]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Estudios</DialogTitle>
          <DialogDescription>
            Paciente: {patient?.firstName} {patient?.lastName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Laboratory Studies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Laboratorio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {laboratoryStudies.map((study) => (
                  <div key={study.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={study.id}
                      checked={selectedLab.includes(study.id)}
                      onCheckedChange={(checked) => handleLabChange(study.id, checked as boolean)}
                    />
                    <Label htmlFor={study.id} className="text-sm cursor-pointer">
                      {study.name}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Imaging Studies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Imágenes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {imagingStudies.map((study) => (
                  <div key={study.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={study.id}
                      checked={selectedImaging.includes(study.id)}
                      onCheckedChange={(checked) => handleImagingChange(study.id, checked as boolean)}
                    />
                    <Label htmlFor={study.id} className="text-sm cursor-pointer">
                      {study.name}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Priority */}
          <div>
            <Label className="text-base font-medium">Prioridad</Label>
            <RadioGroup value={priority} onValueChange={(value: any) => setPriority(value)} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent" id="urgent" />
                <Label htmlFor="urgent">Urgente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="emergency" id="emergency" />
                <Label htmlFor="emergency">Emergencia</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Clinical Observations */}
          <div>
            <Label htmlFor="observations">Observaciones Clínicas</Label>
            <Textarea
              id="observations"
              placeholder="Indicaciones especiales, sospecha diagnóstica..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
            />
          </div>

          {/* Preview */}
          {getSelectedStudiesPreview().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vista Previa de la Orden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Estudios solicitados:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {getSelectedStudiesPreview().map((study, index) => (
                      <li key={index} className="text-sm">
                        {study}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Prioridad:</strong>{" "}
                    {priority === "normal" ? "Normal" : priority === "urgent" ? "Urgente" : "Emergencia"}
                  </p>
                  {observations && (
                    <p className="text-sm text-gray-600">
                      <strong>Observaciones:</strong> {observations}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={selectedLab.length === 0 && selectedImaging.length === 0}>
              Solicitar Estudios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
