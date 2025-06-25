"use client"

import { useHospital } from "@/lib/context"
import React from "react"
import { Sidebar } from "./Sidebar"

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const { state } = useHospital()

    // Solo mostrar el sidebar cuando el usuario esté autenticado y no esté en login
    const showSidebar = state.user && state.currentScreen !== "login"

    if (!showSidebar) {
        // Si no hay usuario o está en login, mostrar solo el contenido
        return <>{children}</>
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    )
} 