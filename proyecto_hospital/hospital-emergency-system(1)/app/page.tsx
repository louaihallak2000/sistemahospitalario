"use client"

import { HospitalProvider } from "@/lib/context"
import { HospitalRouter } from "@/components/HospitalRouter"

export default function Page() {
  return (
    <HospitalProvider>
      <HospitalRouter />
    </HospitalProvider>
  )
}
