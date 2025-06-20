"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search } from "lucide-react"
import { useHospital } from "@/lib/context"
import type { TriageColor } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

interface PatientRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const triageOptions: { value: TriageColor; label: string; color: string }[] = [
  { value: "ROJO", label: "ROJO - Emergencia", color: "#dc2626" },
  { value: "NARANJA", label: "NARANJA - Urgencia", color: "#ea580c" },
  { value: "AMARILLO", label: "AMARILLO - Menos urgente", color: "#ca8a04" },
  { value: "VERDE", label: "VERDE - No urgente", color: "#16a34a" },
  { value: "AZUL", label: "AZUL - Consulta", color: "#2563eb" },
]

export function PatientRegistrationModal({ open, onOpenChange }: PatientRegistrationModalProps) {
  const { addPatient, searchPatient, state } = useHospital()
  const [isSearching, setIsSearching] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState({
    dni: "",
    nombre_completo: "",
    fecha_nacimiento: "",
    sexo: "" as "M" | "F" | "O" | "",
    telefono: "",
    direccion: "",
    contacto_emergencia: "",
    obra_social: "",
    numero_afiliado: "",
    alergias_conocidas: "",
    tipo_sangre: "",
    motivo_consulta: "",
    color_triaje: "" as TriageColor | "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleDniSearch = async () => {
    if (!formData.dni) return

    setIsSearching(true)
    setErrors({})

    try {
      const patient = await searchPatient(formData.dni)

      if (patient) {
        setFormData((prev) => ({
          ...prev,
          nombre_completo: patient.nombre_completo || "",
          fecha_nacimiento: patient.fecha_nacimiento || "",
          sexo: patient.sexo || "",
          telefono: patient.telefono || "",
          direccion: patient.direccion || "",
          contacto_emergencia: patient.contacto_emergencia || "",
          obra_social: patient.obra_social || "",
          numero_afiliado: patient.numero_afiliado || "",
          alergias_conocidas: patient.alergias_conocidas || "",
          tipo_sangre: patient.tipo_sangre || "",
        }))
      }
    } catch (error) {
      console.error("Error searching patient:", error)
      // Don't show error for patient not found, just keep form empty
    } finally {
      setIsSearching(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.dni) newErrors.dni = "DNI es obligatorio"
    if (!formData.nombre_completo) newErrors.nombre_completo = "Nombre es obligatorio"
    if (!formData.motivo_consulta) newErrors.motivo_consulta = "Motivo de consulta es obligatorio"
    if (!formData.color_triaje) newErrors.color_triaje = "Color de triaje es obligatorio"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("")
    setErrors({})

    if (!validateForm()) return

    const result = await addPatient({
      dni: formData.dni,
      nombre_completo: formData.nombre_completo,
      fecha_nacimiento: formData.fecha_nacimiento || undefined,
      sexo: formData.sexo || undefined,
      telefono: formData.telefono || undefined,
      direccion: formData.direccion || undefined,
      contacto_emergencia: formData.contacto_emergencia || undefined,
      obra_social: formData.obra_social || undefined,
      numero_afiliado: formData.numero_afiliado || undefined,
      alergias_conocidas: formData.alergias_conocidas || undefined,
      tipo_sangre: formData.tipo_sangre || undefined,
      motivo_consulta: formData.motivo_consulta,
      color_triaje: formData.color_triaje as TriageColor,
    })

    if (result.success) {
      setSuccessMessage(result.message)
      handleClear()
      setTimeout(() => {
        setSuccessMessage("")
        onOpenChange(false)
      }, 2000)
    }
  }

  const handleClear = () => {
    setFormData({
      dni: "",
      nombre_completo: "",
      fecha_nacimiento: "",
      sexo: "",
      telefono: "",
      direccion: "",
      contacto_emergencia: "",
      obra_social: "",
      numero_afiliado: "",
      alergias_conocidas: "",
      tipo_sangre: "",
      motivo_consulta: "",
      color_triaje: "",
    })
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="bg-white">
          <DialogTitle className="text-gray-900">Registro de Nuevo Paciente</DialogTitle>
          <DialogDescription className="text-gray-600">Complete los datos del paciente para registrarlo en el sistema</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos del Paciente */}
          <Card className="bg-white shadow-sm border">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg text-gray-900">Datos del Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="dni">DNI *</Label>
                  <Input
                    id="dni"
                    value={formData.dni || ""}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    placeholder="12345678"
                    className={errors.dni ? "border-red-500" : ""}
                  />
                  {errors.dni && <p className="text-sm text-red-500 mt-1">{errors.dni}</p>}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDniSearch}
                  disabled={isSearching || !formData.dni}
                  className="mt-6"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre_completo">Nombre Completo *</Label>
                  <Input
                    id="nombre_completo"
                    value={formData.nombre_completo || ""}
                    onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                    placeholder="Juan Carlos Pérez"
                    className={errors.nombre_completo ? "border-red-500" : ""}
                  />
                  {errors.nombre_completo && <p className="text-sm text-red-500 mt-1">{errors.nombre_completo}</p>}
                </div>
                <div>
                  <Label htmlFor="tipo_sangre">Tipo de Sangre</Label>
                  <Input
                    id="tipo_sangre"
                    value={formData.tipo_sangre || ""}
                    onChange={(e) => setFormData({ ...formData, tipo_sangre: e.target.value })}
                    placeholder="O+, A-, B+, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento || ""}
                    onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select
                    value={formData.sexo || ""}
                    onValueChange={(value: "M" | "F" | "O") => setFormData({ ...formData, sexo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="alergias_conocidas">Alergias Conocidas</Label>
                <Input
                  id="alergias_conocidas"
                  value={formData.alergias_conocidas || ""}
                  onChange={(e) => setFormData({ ...formData, alergias_conocidas: e.target.value })}
                  placeholder="Penicilina, mariscos, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="bg-white shadow-sm border">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg text-gray-900">Contacto (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono || ""}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="11-1234-5678"
                />
              </div>
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion || ""}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Calle 123, Ciudad"
                />
              </div>
              <div>
                <Label htmlFor="contacto_emergencia">Contacto de Emergencia</Label>
                <Input
                  id="contacto_emergencia"
                  value={formData.contacto_emergencia || ""}
                  onChange={(e) => setFormData({ ...formData, contacto_emergencia: e.target.value })}
                  placeholder="Nombre y teléfono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cobertura */}
          <Card className="bg-white shadow-sm border">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg text-gray-900">Cobertura (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="obra_social">Obra Social</Label>
                  <Input
                    id="obra_social"
                    value={formData.obra_social || ""}
                    onChange={(e) => setFormData({ ...formData, obra_social: e.target.value })}
                    placeholder="OSDE, Swiss Medical, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="numero_afiliado">Número de Afiliado</Label>
                  <Input
                    id="numero_afiliado"
                    value={formData.numero_afiliado || ""}
                    onChange={(e) => setFormData({ ...formData, numero_afiliado: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Triaje Inicial */}
          <Card className="bg-white shadow-sm border">
            <CardHeader className="bg-white">
              <CardTitle className="text-lg text-gray-900">Triaje Inicial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div>
                <Label htmlFor="motivo_consulta">Motivo de Consulta *</Label>
                <Textarea
                  id="motivo_consulta"
                  value={formData.motivo_consulta || ""}
                  onChange={(e) => setFormData({ ...formData, motivo_consulta: e.target.value })}
                  placeholder="Describa el motivo de la consulta..."
                  className={errors.motivo_consulta ? "border-red-500 bg-white" : "bg-white"}
                />
                {errors.motivo_consulta && <p className="text-sm text-red-500 mt-1">{errors.motivo_consulta}</p>}
              </div>

              <div>
                <Label>Color de Triaje *</Label>
                <RadioGroup
                  value={formData.color_triaje || ""}
                  onValueChange={(value: TriageColor) => setFormData({ ...formData, color_triaje: value })}
                  className="mt-2"
                >
                  {triageOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex items-center cursor-pointer">
                        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: option.color }} />
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {errors.color_triaje && <p className="text-sm text-red-500 mt-1">{errors.color_triaje}</p>}
              </div>
            </CardContent>
          </Card>

          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="outline" onClick={handleClear}>
              Limpiar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={state.isLoading}>
              {state.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Paciente"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
