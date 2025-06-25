"use client"

import { useHospital } from "@/lib/context"
import HistoriasClinicasPage from "../app/pacientes/historias-clinicas/page"
import { AppLayout } from "./AppLayout"
import { Dashboard } from "./Dashboard"
import { EnhancedNursingView } from "./EnhancedNursingView"
import { LoginScreen } from "./LoginScreen"
import { PatientRecord } from "./PatientRecord"

export function HospitalApp() {
  const { state } = useHospital()

  console.log("🔍 HospitalApp - currentScreen:", state.currentScreen)
  console.log("🔍 HospitalApp - user:", state.user ? "authenticated" : "not authenticated")
  console.log("🔍 HospitalApp - selectedPatient:", state.selectedPatient ? "selected" : "none")

  const renderCurrentScreen = () => {
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
      case "nursing":
        console.log("📱 Renderizando: EnhancedNursingView")
        return <EnhancedNursingView />
      case "historias-clinicas":
        console.log("📱 Renderizando: HistoriasClinicasPage")
        return <HistoriasClinicasPage />
      default:
        console.error("🚨 PROBLEMA ENCONTRADO - Screen no reconocida:", state.currentScreen)
        console.error("🔧 SOLUCION: Agregando caso 'patient' faltante")
        console.log("📱 Fallback: LoginScreen (por screen desconocida)")
        return <LoginScreen />
    }
  }

  return (
    <AppLayout>
      {renderCurrentScreen()}
    </AppLayout>
  )
}
