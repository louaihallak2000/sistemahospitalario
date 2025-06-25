"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHospital } from "@/lib/context"
import { Hospital, Loader2 } from "lucide-react"
import { useState } from "react"

export function LoginScreen() {
  const { state, login } = useHospital()
  const [formData, setFormData] = useState({
    hospitalId: "",
    username: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.hospitalId || !formData.username || !formData.password) {
      return
    }
    await login(formData.hospitalId, formData.username, formData.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg border-0">
        <CardHeader className="text-center bg-white">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full shadow-md">
              <Hospital className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Sistema Hospitalario</CardTitle>
          <CardDescription className="text-gray-600">Ingrese sus credenciales para acceder al sistema</CardDescription>
        </CardHeader>
        <CardContent className="bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospital" className="text-gray-700 font-medium">Hospital</Label>
              <Select
                value={formData.hospitalId}
                onValueChange={(value) => setFormData({ ...formData, hospitalId: value })}
              >
                <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200">
                  <SelectValue placeholder="Seleccione un hospital" />
                </SelectTrigger>
                <SelectContent>
                  {state.hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.code} - {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Ingrese su usuario"
                className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Ingrese su contraseña"
                className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                required
              />
            </div>

            {state.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={state.isLoading}>
              {state.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-semibold mb-1">Credenciales de prueba:</p>
            <div className="space-y-0.5">
              <p className="text-sm text-blue-700"><span className="font-medium">Usuario:</span> dr.martinez</p>
              <p className="text-sm text-blue-700"><span className="font-medium">Contraseña:</span> medico123</p>
              <p className="text-sm text-blue-700"><span className="font-medium">Hospital:</span> HG001</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
