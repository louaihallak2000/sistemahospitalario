"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useHospital } from "@/lib/context"

interface EvolutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EvolutionModal({ open, onOpenChange }: EvolutionModalProps) {
  const { state, addEvolution } = useHospital()
  const [formData, setFormData] = useState({
    content: "",
    bloodPressure: "120/80",
    heartRate: 72,
    temperature: 36.5,
    oxygenSaturation: 98,
  })

  const patient = state.selectedPatient?.patient
  const episode = state.selectedPatient?.episode
  const currentDate = new Date().toLocaleDateString("es-AR")
  const currentTime = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!episode) return

    const evolution = {
      content: formData.content,
      vitalSigns: {
        bloodPressure: formData.bloodPressure,
        heartRate: formData.heartRate,
        temperature: formData.temperature,
        oxygenSaturation: formData.oxygenSaturation,
      },
    }

    await addEvolution(episode.id, evolution)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      content: "",
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 36.5,
      oxygenSaturation: 98,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Evolución Médica</DialogTitle>
          <DialogDescription>
            Paciente: {patient?.firstName} {patient?.lastName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Doctor Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-500">Fecha</Label>
                  <p className="font-medium">{currentDate}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Hora</Label>
                  <p className="font-medium">{currentTime}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Médico</Label>
                  <p className="font-medium">{state.user?.username}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Hospital</Label>
                  <p className="font-medium">{state.user?.hospitalName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Evolution */}
          <div>
            <Label htmlFor="content">Evolución Clínica *</Label>
            <Textarea
              id="content"
              placeholder="Paciente refiere mejoría del dolor abdominal. Al examen físico se encuentra..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              required
            />
          </div>

          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Signos Vitales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bloodPressure">Presión Arterial</Label>
                  <Input
                    id="bloodPressure"
                    placeholder="120/80"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="heartRate">Frecuencia Cardíaca</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    placeholder="72"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({ ...formData, heartRate: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">Temperatura (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="oxygenSaturation">Saturación O2 (%)</Label>
                  <Input
                    id="oxygenSaturation"
                    type="number"
                    placeholder="98"
                    value={formData.oxygenSaturation}
                    onChange={(e) =>
                      setFormData({ ...formData, oxygenSaturation: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Evolución</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
