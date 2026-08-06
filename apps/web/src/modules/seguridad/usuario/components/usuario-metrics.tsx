"use client";

import * as React from "react";
import { Users, ShieldCheck, ShieldAlert, KeyRound } from "lucide-react";
import { MetricCard } from "@/components/shared";
import type { UsuarioMetrics } from "../types/usuario.types";

interface UsuarioMetricsProps {
  metrics: UsuarioMetrics;
}

export function UsuarioMetricsCards({ metrics }: UsuarioMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        title="Usuarios Totales"
        value={metrics.totalUsuarios}
        description="Cuentas registradas"
        icon={Users}
        iconClassName="text-primary"
        isMono={false}
      />

      <MetricCard
        title="Cuentas Activas"
        value={metrics.cuentasActivas}
        description="Acceso habilitado al sistema"
        icon={ShieldCheck}
        iconClassName="text-emerald-500"
        isMono={false}
      />

      <MetricCard
        title="Cuentas Bloqueadas"
        value={metrics.cuentasBloqueadas}
        description="Acceso inhabilitado o suspendido"
        icon={ShieldAlert}
        iconClassName="text-destructive"
        isMono={false}
      />

      <MetricCard
        title="Cobertura de Seguridad"
        value={`${metrics.coberturaSeguridad}%`}
        description="Con roles y permisos vigentes"
        icon={KeyRound}
        iconClassName="text-blue-500"
        isMono={false}
      />
    </div>
  );
}
