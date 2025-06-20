"use client"

import { useHospital } from "@/lib/context"
import { LoginScreen } from "./LoginScreen"
import { Dashboard } from "./Dashboard"

export function HospitalApp() {
  const { state } = useHospital()

  switch (state.currentScreen) {
    case "login":
      return <LoginScreen />
    case "dashboard":
      return <Dashboard />
    default:
      return <LoginScreen />
  }
}
