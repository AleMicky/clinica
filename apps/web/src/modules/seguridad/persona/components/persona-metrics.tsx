"use client";

import * as React from "react";
import { Users, UserCheck, PhoneCall, FileText } from "lucide-react";
import { MetricCard } from "@/components/shared";
import type { PersonaMetrics } from "../types/persona.types";

interface PersonaMetricsProps {
  metrics: PersonaMetrics;
}

export function PersonaMetricsCards({ metrics }: PersonaMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        title="Total Personas"
        value={metrics.totalPersonas}
        description="Registradas en la base de datos"
        icon={Users}
        iconClassName="text-primary"
        isMono={false}
      />

      <MetricCard
        title="Personas Activas"
        value={metrics.personasActivas}
        description="Con registro activo"
        icon={UserCheck}
        iconClassName="text-emerald-500"
        isMono={false}
      />

      <MetricCard
        title="Con Contacto"
        value={metrics.conTelefono}
        description="Número de teléfono registrado"
        icon={PhoneCall}
        iconClassName="text-blue-500"
        isMono={false}
      />

      <MetricCard
        title="Inactivas / Bajas"
        value={metrics.personasInactivas}
        description="Expedientes inactivos"
        icon={FileText}
        iconClassName="text-muted-foreground"
        isMono={false}
      />
    </div>
  );
}
