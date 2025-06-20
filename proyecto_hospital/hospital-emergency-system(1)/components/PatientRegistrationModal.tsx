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
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "" as "M" | "F" | "O" | "",
    phone: "",
    address: "",
    emergencyContact: "",
    insurance: "",
    insuranceNumber: "",
    consultationReason: "",
    triageColor: "" as TriageColor | "",
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
          firstName: patient.firstName || "",
          lastName: patient.lastName || "",
          birthDate: patient.birthDate || "",
          gender: patient.gender || "",
          phone: patient.phone || "",
          address: patient.address || "",
          emergencyContact: patient.emergencyContact || "",
          insurance: patient.insurance || "",
          insuranceNumber: patient.insuranceNumber || "",
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
    if (!formData.firstName) newErrors.firstName = "Nombre es obligatorio"
    if (!formData.lastName) newErrors.lastName = "Apellido es obligatorio"
    if (!formData.consultationReason) newErrors.consultationReason = "Motivo de consulta es obligatorio"
    if (!formData.triageColor) newErrors.triageColor = "Color de triaje es obligatorio"

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
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthDate: formData.birthDate || undefined,
      gender: formData.gender || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      emergencyContact: formData.emergencyContact || undefined,
      insurance: formData.insurance || undefined,
      insuranceNumber: formData.insuranceNumber || undefined,
      consultationReason: formData.consultationReason,
      triageColor: formData.triageColor as TriageColor,
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
      firstName: "",
      lastName: "",
      birthDate: "",
      gender: "",
      phone: "",
      address: "",
      emergencyContact: "",
      insurance: "",
      insuranceNumber: "",
      consultationReason: "",
      triageColor: "",
    })
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registro de Nuevo Paciente</DialogTitle>
          <DialogDescription>Complete los datos del paciente para registrarlo en el sistema</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos del Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos del Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="dni">DNI *</Label>
                  <Input
                    id="dni"
                    value={formData.dni}
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
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Sexo</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: "M" | "F" | "O") => setFormData({ ...formData, gender: value })}
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
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contacto (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="11-1234-5678"
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle 123, Ciudad"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Nombre y teléfono"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cobertura */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cobertura (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insurance">Obra Social</Label>
                  <Input
                    id="insurance"
                    value={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                    placeholder="OSDE, Swiss Medical, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceNumber">Número de Afiliado</Label>
                  <Input
                    id="insuranceNumber"
                    value={formData.insuranceNumber}
                    onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Triaje Inicial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Triaje Inicial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="consultationReason">Motivo de Consulta *</Label>
                <Textarea
                  id="consultationReason"
                  value={formData.consultationReason}
                  onChange={(e) => setFormData({ ...formData, consultationReason: e.target.value })}
                  placeholder="Describa el motivo de la consulta..."
                  className={errors.consultationReason ? "border-red-500" : ""}
                />
                {errors.consultationReason && <p className="text-sm text-red-500 mt-1">{errors.consultationReason}</p>}
              </div>

              <div>
                <Label>Color de Triaje *</Label>
                <RadioGroup
                  value={formData.triageColor}
                  onValueChange={(value: TriageColor) => setFormData({ ...formData, triageColor: value })}
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
                {errors.triageColor && <p className="text-sm text-red-500 mt-1">{errors.triageColor}</p>}
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
