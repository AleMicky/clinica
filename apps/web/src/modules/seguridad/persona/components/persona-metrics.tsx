"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Phone, UserX } from "lucide-react";
import type { PersonaMetrics } from "../types/persona.types";

interface PersonaMetricsCardsProps {
  metrics: PersonaMetrics;
}

export function PersonaMetricsCards({ metrics }: PersonaMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total Personas */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Personas
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-foreground tracking-tight">
                {metrics.totalPersonas}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                registradas
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Users className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Personas Activas */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Personas Activas
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.personasActivas}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                habilitadas
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <UserCheck className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Con Teléfono de Contacto */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Con Teléfono
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                {metrics.conTelefono}
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                contactables
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
            <Phone className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Inactivas */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Inactivas
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                {metrics.personasInactivas}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium ml-1">
                deshabilitadas
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
            <UserX className="size-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
