"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Layers, Folder, CornerDownRight, ShieldX } from "lucide-react";
import type { OpcionMenuMetrics } from "../types/opcion-menu.types";

interface OpcionMenuMetricsProps {
  metrics: OpcionMenuMetrics;
  isLoading?: boolean;
}

export function OpcionMenuMetricsCards({
  metrics,
  isLoading = false,
}: OpcionMenuMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total Opciones */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Opciones
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-foreground tracking-tight">
                {isLoading ? "-" : metrics.totalOpciones}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                en el sistema
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Layers className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Módulos Principales (Raíz) */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Módulos Raíz
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {isLoading ? "-" : metrics.modulosPrincipales}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                principales
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Folder className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Submenús / Hijos */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Submenús y Hojas
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                {isLoading ? "-" : metrics.submenus}
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                rutas y acciones
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
            <CornerDownRight className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Inactivas */}
      <Card className="border border-border/70 bg-card hover:shadow-xs transition-all duration-200">
        <CardContent className="p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Inactivos
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                {isLoading ? "-" : metrics.inactivas}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                deshabilitados
              </span>
            </div>
          </div>
          <div className="size-8.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
            <ShieldX className="size-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
