"use client"

import * as React from "react"
import { Star, Coins, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MonedaMetrics } from "../types/moneda.types"

interface MonedaMetricsProps {
  metrics: MonedaMetrics
}

export function MonedaMetricsCards({ metrics }: MonedaMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Moneda Principal</CardTitle>
          <Star className="size-4 text-amber-500 fill-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.monedaBase}</div>
          <p className="text-xs text-muted-foreground mt-1">Moneda base del sistema</p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Monedas Habilitadas</CardTitle>
          <Coins className="size-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.monedasHabilitadas}</div>
          <p className="text-xs text-muted-foreground mt-1">Disponibles en cobros</p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Facturación Multimoneda</CardTitle>
          <Globe className="size-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.facturacionMultimoneda ? "Activa" : "Inactiva"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Conversión en tiempo real</p>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Monedas Inactivas</CardTitle>
          <Coins className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.monedasInactivas}</div>
          <p className="text-xs text-muted-foreground mt-1">Fuera de circulación local</p>
        </CardContent>
      </Card>
    </div>
  )
}
