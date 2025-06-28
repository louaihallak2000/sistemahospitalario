"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useHospital } from '@/lib/context'
import { Activity, AlertTriangle, Brain, Building2, FileText, Heart, Home, Siren, Stethoscope, UserPlus, Users, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SidebarProps {
    userRole?: string;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    path: string;
    badge: number | null;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
    roles: string[];
}

export function Sidebar({ userRole = "admin" }: SidebarProps) {
    const router = useRouter()
    const { state } = useHospital()
    const [activeCodes, setActiveCodes] = useState(0)
    const [currentView, setCurrentView] = useState("dashboard")

    // Simular códigos activos y estadísticas (esto vendrá de la API real)
    useEffect(() => {
        // TODO: Fetch active emergency codes and triage stats
        setActiveCodes(0)
    }, [])

    const handleNavigation = (screen: string, path?: string) => {
        setCurrentView(screen)
        if (path) {
            router.push(path)
        }
    }

    // Simular estadísticas de triaje temporalmente
    const triageStats = {
        waiting: 5,
        red: 2,
        orange: 3,
        yellow: 8,
        green: 12,
        blue: 1
    }

    // Menú para diferentes roles
    const getMenuItems = (): MenuItem[] => {
        const baseItems: MenuItem[] = [
            {
                id: "dashboard",
                label: "Dashboard",
                icon: Home,
                path: "/dashboard",
                badge: null,
                roles: ["admin", "medico", "enfermera"]
            }
        ]

        const emergencyItems: MenuItem[] = [
            {
                id: "emergency-codes",
                label: "Códigos de Emergencia",
                icon: Siren,
                path: "/codigos-emergencia",
                badge: activeCodes > 0 ? activeCodes : null,
                badgeVariant: "destructive",
                roles: ["admin", "medico", "enfermera"]
            }
        ]

        const admissionItems: MenuItem[] = [
            {
                id: "admission",
                label: "Admisión",
                icon: UserPlus,
                path: "/admision",
                badge: null,
                roles: ["admin", "enfermera"]
            }
        ]

        const nursingItems: MenuItem[] = [
            {
                id: "nursing-triage",
                label: "Triaje",
                icon: Activity,
                path: "/enfermeria/triaje",
                badge: triageStats.waiting,
                badgeVariant: "default",
                roles: ["admin", "enfermera"]
            },
            {
                id: "nursing-decisions",
                label: "Decisiones Post-Triaje",
                icon: FileText,
                path: "/enfermeria/decisiones",
                badge: null,
                roles: ["admin", "enfermera"]
            }
        ]

        const medicalItems: MenuItem[] = [
            {
                id: "medical-list",
                label: "Lista Médica",
                icon: Stethoscope,
                path: "/medicos/lista",
                badge: triageStats.red + triageStats.orange + triageStats.yellow,
                badgeVariant: "secondary",
                roles: ["admin", "medico"]
            }
        ]

        const shockroomItems: MenuItem[] = [
            {
                id: "shockroom",
                label: "Shockroom",
                icon: Heart,
                path: "/shockroom",
                badge: null,
                roles: ["admin", "medico", "enfermera"]
            }
        ]

        return [
            ...baseItems,
            ...emergencyItems,
            ...admissionItems,
            ...nursingItems,
            ...medicalItems,
            ...shockroomItems
        ].filter(item => item.roles.includes(userRole))
    }

    const menuItems = getMenuItems()

    return (
        <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <Building2 className="h-8 w-8 text-blue-600" />
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
                        <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 capitalize">{userRole}</p>
                        <p className="text-sm text-gray-500">Hospital HOSP001</p>
                    </div>
                </div>
            </div>

            {/* Códigos de emergencia activos */}
            {activeCodes > 0 && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-900">
                            {activeCodes} Código{activeCodes > 1 ? 's' : ''} Activo{activeCodes > 1 ? 's' : ''}
                        </span>
                    </div>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="w-full mt-2"
                        onClick={() => handleNavigation('emergency-codes', '/codigos-emergencia')}
                    >
                        <Siren className="h-4 w-4 mr-2" />
                        Ver Códigos
                    </Button>
                </div>
            )}

            {/* Menú de navegación */}
            <nav className="mt-6">
                <div className="px-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = currentView === item.id

                        return (
                            <Button
                                key={item.id}
                                variant={isActive ? "default" : "ghost"}
                                className={`w-full justify-start mb-1 ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                onClick={() => handleNavigation(item.id, item.path)}
                            >
                                <Icon className="mr-3 h-4 w-4" />
                                <span className="flex-1 text-left">{item.label}</span>
                                {item.badge && (
                                    <Badge
                                        variant={item.badgeVariant || "default"}
                                        className="ml-2"
                                    >
                                        {item.badge}
                                    </Badge>
                                )}
                            </Button>
                        )
                    })}
                </div>
            </nav>

            {/* Sección de workflow rápido */}
            <div className="mt-8 px-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Acceso Rápido
                </h3>
                <div className="space-y-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('emergency-codes', '/codigos-emergencia')}
                    >
                        <Brain className="mr-2 h-3 w-3" />
                        Código ACV
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('emergency-codes', '/codigos-emergencia')}
                    >
                        <Heart className="mr-2 h-3 w-3" />
                        Código IAM
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleNavigation('emergency-codes', '/codigos-emergencia')}
                    >
                        <Zap className="mr-2 h-3 w-3" />
                        Código Azul
                    </Button>
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