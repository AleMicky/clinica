"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import type { UsuarioMetrics } from "../types/usuario.types";

interface UsuarioMetricsCardsProps {
  metrics: UsuarioMetrics;
}

export function UsuarioMetricsCards({ metrics }: UsuarioMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total Usuarios */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Usuarios
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-foreground tracking-tight">
                {metrics.totalUsuarios}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                registrados
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Users className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Cuentas Activas */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Cuentas Activas
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {metrics.cuentasActivas}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                habilitadas
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <ShieldCheck className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Inactivas / Bloqueadas */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Cuentas Inactivas
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                {metrics.cuentasBloqueadas}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                bloqueadas
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
            <ShieldAlert className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Cobertura de Seguridad */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Disponibilidad
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                {metrics.coberturaSeguridad}%
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                cuentas operativas
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
            <Shield className="size-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
