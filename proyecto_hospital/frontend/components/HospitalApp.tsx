"use client"

import { useState } from 'react'
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

// Tipos para navegación
type NavigationPage =
  | 'dashboard'
  | 'codigos-emergencia'
  | 'admision'
  | 'enfermeria-triaje'
  | 'enfermeria-decisiones'
  | 'enfermeria-legacy'
  | 'medicos-lista'
  | 'medicos-atencion'
  | 'shockroom'
  | 'pacientes'

export function HospitalApp() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard')

  const navigate = (page: NavigationPage) => {
    setCurrentPage(page)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />

      case 'codigos-emergencia':
        return <EmergencyCodesView />

      case 'admision':
        return <AdmissionView />

      case 'enfermeria-triaje':
        return <TriageView />

      case 'enfermeria-decisiones':
        return <NursingDecisionView />

      case 'enfermeria-legacy':
        return <EnhancedNursingView />

      case 'medicos-lista':
        return <MedicalListView />

      case 'medicos-atencion':
        return <MedicalAttentionView />

      case 'shockroom':
        return <ShockroomView />

      case 'pacientes':
        return <PatientRecord />

      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <NavigationSidebar
        currentPage={currentPage}
        onNavigate={navigate}
      />

      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto p-6">
          {renderCurrentPage()}
        </div>
      </main>
    </div>
  )
}

// Sidebar de navegación
function NavigationSidebar({
  currentPage,
  onNavigate
}: {
  currentPage: NavigationPage
  onNavigate: (page: NavigationPage) => void
}) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">H</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hospital</h1>
            <p className="text-sm text-gray-500">Sistema Integrado</p>
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">M</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Médico de Guardia</p>
            <p className="text-sm text-gray-500">Hospital HOSP001</p>
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'codigos-emergencia', label: 'Códigos de Emergencia', icon: '🚨' },
            { id: 'admision', label: 'Admisión', icon: '📝' },
            { id: 'enfermeria-triaje', label: 'Triaje', icon: '🩺' },
            { id: 'enfermeria-decisiones', label: 'Decisiones Post-Triaje', icon: '📋' },
            { id: 'medicos-lista', label: 'Lista Médica', icon: '👨‍⚕️' },
            { id: 'shockroom', label: 'Shockroom', icon: '🏥' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as NavigationPage)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Acceso Rápido */}
      <div className="mt-8 px-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Acceso Rápido
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => onNavigate('codigos-emergencia')}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            🧠 Código ACV
          </button>
          <button
            onClick={() => onNavigate('codigos-emergencia')}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            ❤️ Código IAM
          </button>
          <button
            onClick={() => onNavigate('codigos-emergencia')}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            ⚡ Código Azul
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Sistema Hospitalario v1.0
        </p>
        <p className="text-xs text-gray-400 text-center">
          Nuevo Workflow Implementado
        </p>
      </div>
    </div>
  )
}

export default HospitalApp
