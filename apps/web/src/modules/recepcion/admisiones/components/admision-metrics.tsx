"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CreditCard, Stethoscope, DollarSign } from "lucide-react";
import type { AdmisionMetrics } from "../types/admision.types";

interface AdmisionMetricsCardsProps {
  metrics: AdmisionMetrics;
}

export function AdmisionMetricsCards({ metrics }: AdmisionMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Admisiones Hoy */}
      <Card className="border border-border/70 bg-card hover:shadow-md transition-all duration-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Admisiones del Día
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground tracking-tight">
                {metrics.totalHoy}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Hoy
              </span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Users className="size-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Pendientes de Pago */}
      <Card className="border border-border/70 bg-card hover:shadow-md transition-all duration-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Pendientes de Cobro
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
                {metrics.pendientesPago}
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                por facturar
              </span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <CreditCard className="size-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Pacientes en Atención */}
      <Card className="border border-border/70 bg-card hover:shadow-md transition-all duration-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              En Atención Médica
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 tracking-tight">
                {metrics.enAtencion}
              </span>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                en consultorio
              </span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Stethoscope className="size-5 animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Monto Facturado / Recaudado Día */}
      <Card className="border border-border/70 bg-card hover:shadow-md transition-all duration-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Volumen Estimado Día
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-sm font-semibold text-emerald-600">S/.</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.montoTotalHoy.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <DollarSign className="size-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
