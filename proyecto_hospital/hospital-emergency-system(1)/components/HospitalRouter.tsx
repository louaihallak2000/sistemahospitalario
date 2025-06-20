"use client"

import { useHospital } from "@/lib/context"
import { LoginScreen } from "./LoginScreen"
import { Dashboard } from "./Dashboard"
import { PatientRecord } from "./PatientRecord"

export function HospitalRouter() {
  const { state } = useHospital()

  // Simple routing based on state
  if (state.currentScreen === "login") {
    return <LoginScreen />
  }

  if (state.currentScreen === "dashboard") {
    return <Dashboard />
  }

  if (state.currentScreen === "patient" && state.selectedPatient) {
    return <PatientRecord />
  }

  return <LoginScreen />
}
