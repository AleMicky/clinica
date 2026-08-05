"use client"

import * as React from "react"
import { Coins, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MonedaHeaderProps {
  onAddClick?: () => void
}

export function MonedaHeader({ onAddClick }: MonedaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Coins className="size-6 text-primary" />
          Monedas y Divisas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configuración de monedas operativas, de facturación y moneda principal de contabilidad.
        </p>
      </div>
      <Button onClick={onAddClick} className="shrink-0 gap-2">
        <Plus className="size-4" />
        <span>Agregar Moneda</span>
      </Button>
    </div>
  )
}
