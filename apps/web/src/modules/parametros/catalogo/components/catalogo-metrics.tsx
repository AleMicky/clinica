"use client";

import * as React from "react";
import { FolderTree, Tag, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CatalogoMetrics } from "../types/catalogo.types";

interface CatalogoMetricsProps {
  metrics: CatalogoMetrics;
}

export function CatalogoMetricsCards({ metrics }: CatalogoMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs">
        <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
          <FolderTree className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Total Catálogos
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-bold tracking-tight text-foreground">{metrics.totalCatalogos}</span>
            <span className="text-[10px] text-muted-foreground hidden xl:inline">maestras</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs">
        <div className="p-2 rounded-md bg-blue-500/10 text-blue-500 shrink-0">
          <Tag className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Elementos Totales
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-bold tracking-tight text-foreground">{metrics.elementosRegistrados}</span>
            <span className="text-[10px] text-muted-foreground hidden xl:inline">ítems</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs">
        <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500 shrink-0">
          <CheckCircle2 className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Catálogos Activos
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-bold tracking-tight text-foreground">{metrics.catalogosActivos}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium hidden xl:inline">operativos</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-card shadow-2xs">
        <div className="p-2 rounded-md bg-amber-500/10 text-amber-500 shrink-0">
          <XCircle className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
            Inactivos
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-bold tracking-tight text-foreground">{metrics.catalogosInactivos}</span>
            <span className="text-[10px] text-muted-foreground hidden xl:inline">deshabilitados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
