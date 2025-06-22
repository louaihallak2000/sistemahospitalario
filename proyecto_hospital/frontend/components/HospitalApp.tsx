"use client"

import { useHospital } from "@/lib/context"
import { LoginScreen } from "./LoginScreen"
import { Dashboard } from "./Dashboard"
import { PatientRecord } from "./PatientRecord"
import { AdmissionView } from "./AdmissionView"
import { NursingView } from "./NursingView"

export function HospitalApp() {
  const { state } = useHospital()

  console.log("🔍 HospitalApp - currentScreen:", state.currentScreen)
  console.log("🔍 HospitalApp - user:", state.user ? "authenticated" : "not authenticated")
  console.log("🔍 HospitalApp - selectedPatient:", state.selectedPatient ? "selected" : "none")

  switch (state.currentScreen) {
    case "login":
      console.log("📱 Renderizando: LoginScreen")
      return <LoginScreen />
    case "dashboard":
      console.log("📱 Renderizando: Dashboard")
      return <Dashboard />
    case "patient":
      console.log("📱 Renderizando: PatientRecord")
      return <PatientRecord />
    case "admission":
      console.log("📱 Renderizando: AdmissionView")
      return <AdmissionView />
    case "nursing":
      console.log("📱 Renderizando: NursingView")
      return <NursingView />
    default:
      console.error("🚨 PROBLEMA ENCONTRADO - Screen no reconocida:", state.currentScreen)
      console.error("🔧 SOLUCION: Agregando caso 'patient' faltante")
      console.log("📱 Fallback: LoginScreen (por screen desconocida)")
      return <LoginScreen />
  }
}
