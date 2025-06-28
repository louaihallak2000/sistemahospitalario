"use client"

import { usePathname } from 'next/navigation'
import { AdmissionView } from './AdmissionView'
import { Dashboard } from './Dashboard'
import { EnhancedNursingView } from './EnhancedNursingView'
import { PatientRecord } from './PatientRecord'
import { ShockroomView } from './ShockroomView'
import EmergencyCodesView from './emergency/EmergencyCodesView'
import MedicalAttentionView from './medical/MedicalAttentionView'
import MedicalListView from './medical/MedicalListView'
import NursingDecisionView from './nursing/NursingDecisionView'
import TriageView from './triage/TriageView'

export default function HospitalRouter() {
  const pathname = usePathname()

  // Determinar qué componente mostrar basado en la ruta
  const renderComponent = () => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return <Dashboard />

      case '/codigos-emergencia':
        return <EmergencyCodesView />

      case '/admision':
        return <AdmissionView />

      case '/enfermeria':
      case '/enfermeria/triaje':
        return <TriageView />

      case '/enfermeria/decisiones':
        return <NursingDecisionView />

      case '/enfermeria/legacy':
        return <EnhancedNursingView />

      case '/medicos':
      case '/medicos/lista':
        return <MedicalListView />

      case '/shockroom':
        return <ShockroomView />

      default:
        // Si la ruta coincide con atención médica
        if (pathname?.startsWith('/medicos/atencion/')) {
          return <MedicalAttentionView />
        }

        // Si la ruta coincide con pacientes
        if (pathname?.startsWith('/pacientes/')) {
          return <PatientRecord />
        }

        // Por defecto, dashboard
        return <Dashboard />
    }
  }

  return (
    <div className="w-full h-full">
      {renderComponent()}
    </div>
  )
}
