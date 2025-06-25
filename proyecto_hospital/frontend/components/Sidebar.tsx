"use client"

import { Button } from "@/components/ui/button"
import { useHospital } from "@/lib/context"
import { cn } from "@/lib/utils"
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    HeartPulse,
    Hospital,
    Monitor,
    Upload,
    UserCheck
} from "lucide-react"
import React, { useState } from "react"

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const { state, dispatch } = useHospital()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const currentScreen = state.currentScreen

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed)
    }

    const navigateTo = (screen: string) => {
        console.log(`🔄 Navegando a: ${screen}`)
        dispatch({ type: "SET_SCREEN", payload: screen as any })
    }

    // Función helper para determinar si una sección está activa
    const isActiveSection = (section: string) => {
        switch (section) {
            case "dashboard":
                return currentScreen === "dashboard"
            case "lista-espera":
                return currentScreen === "dashboard" // Por ahora va al dashboard
            case "triaje":
                return currentScreen === "dashboard" // Por ahora va al dashboard  
            case "enfermeria":
                return currentScreen === "nursing"
            case "historias-clinicas":
                return currentScreen === "historias-clinicas"
            case "importar":
                return false // Por implementar
            default:
                return false
        }
    }

    const MenuItem = ({
        icon: Icon,
        label,
        onClick,
        isActive = false,
        isSubitem = false
    }: {
        icon: React.ComponentType<any>
        label: string
        onClick: () => void
        isActive?: boolean
        isSubitem?: boolean
    }) => (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isSubitem ? "pl-8 text-gray-600" : "text-gray-700",
                isActive
                    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-500"
                    : "hover:bg-gray-100 hover:text-gray-900",
                isCollapsed && "justify-center px-2"
            )}
        >
            <Icon className={cn("h-4 w-4", isCollapsed ? "" : "mr-3")} />
            {!isCollapsed && <span>{label}</span>}
        </button>
    )

    const SectionHeader = ({ label }: { label: string }) => (
        !isCollapsed && (
            <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {label}
                </h3>
            </div>
        )
    )

    return (
        <div className={cn(
            "bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300",
            isCollapsed ? "w-16" : "w-64",
            className
        )}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex items-center">
                        <Hospital className="h-6 w-6 text-blue-600 mr-2" />
                        <span className="font-semibold text-gray-900">Sistema</span>
                    </div>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="p-1"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {/* Sistema */}
                <SectionHeader label="Sistema" />
                <MenuItem
                    icon={AlertTriangle}
                    label="Emergencia"
                    onClick={() => navigateTo("dashboard")}
                    isActive={isActiveSection("dashboard")}
                />

                {/* Pacientes */}
                <div className="pt-4">
                    <SectionHeader label="Pacientes" />
                    <MenuItem
                        icon={FileText}
                        label="Historias Clínicas"
                        onClick={() => {
                            console.log("🔄 Navegando a Historias Clínicas")
                            navigateTo("historias-clinicas")
                        }}
                        isActive={isActiveSection("historias-clinicas")}
                        isSubitem
                    />
                    <MenuItem
                        icon={Upload}
                        label="Importar Datos"
                        onClick={() => {
                            console.log("🔄 Importar Datos - Por implementar")
                            // navigateTo("importar")
                        }}
                        isActive={isActiveSection("importar")}
                        isSubitem
                    />
                </div>

                {/* Emergencia */}
                <div className="pt-4">
                    <SectionHeader label="Emergencia" />
                    <MenuItem
                        icon={Clock}
                        label="Lista de Espera"
                        onClick={() => navigateTo("dashboard")}
                        isActive={isActiveSection("lista-espera")}
                        isSubitem
                    />
                    <MenuItem
                        icon={UserCheck}
                        label="Triaje"
                        onClick={() => navigateTo("dashboard")}
                        isActive={isActiveSection("triaje")}
                        isSubitem
                    />
                    <MenuItem
                        icon={Monitor}
                        label="Dashboard Médicos"
                        onClick={() => navigateTo("dashboard")}
                        isActive={isActiveSection("dashboard")}
                        isSubitem
                    />
                    <MenuItem
                        icon={HeartPulse}
                        label="Panel Enfermería"
                        onClick={() => navigateTo("nursing")}
                        isActive={isActiveSection("enfermeria")}
                        isSubitem
                    />
                </div>
            </nav>

            {/* Footer */}
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                        <p>Usuario: {state.user?.username}</p>
                        <p>Hospital: {state.user?.hospitalName}</p>
                    </div>
                </div>
            )}
        </div>
    )
} 