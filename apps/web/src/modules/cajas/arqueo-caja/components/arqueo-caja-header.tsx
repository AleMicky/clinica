"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Calculator,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

interface ArqueoCajaHeaderProps {
  readonly onNewArqueoClick: () => void;
  readonly onRefresh?: () => void;
  readonly cajeroNombre?: string | null;
  readonly esAdmin?: boolean;
  readonly soloPropio?: boolean;
  readonly onSoloPropioChange?: (soloPropio: boolean) => void;
}

export function ArqueoCajaHeader({
  onNewArqueoClick,
  onRefresh,
  cajeroNombre,
  esAdmin = false,
  soloPropio = false,
  onSoloPropioChange,
}: Readonly<ArqueoCajaHeaderProps>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-card via-card to-amber-500/5 px-4 py-2.5 rounded-xl border border-border/70 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="size-8.5 rounded-lg bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-primary/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-2xs shrink-0">
          <Calculator className="size-4.5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-bold text-foreground tracking-tight">
              Arqueos y Cierres de Caja
            </h1>
            <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.2 rounded-full border border-amber-500/20 flex items-center gap-1">
              <Sparkles className="size-2.5" />
              Conciliación
            </span>
            {cajeroNombre && (
              <Badge
                variant="outline"
                className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20 gap-1"
              >
                <UserCheck className="size-3" />
                {cajeroNombre}
              </Badge>
            )}
            {esAdmin && (
              <Badge
                variant="outline"
                className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1"
              >
                <ShieldCheck className="size-3" />
                Administrador
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {esAdmin && !soloPropio
              ? "Vista general de todos los arqueos y cierres registrados en el sistema."
              : "Listado de arqueos y conciliaciones correspondientes a su sesión activa."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
        {esAdmin && onSoloPropioChange && (
          <div className="inline-flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => onSoloPropioChange(false)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                !soloPropio
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="size-3.5" />
              Ver Todo (Admin)
            </button>
            <button
              type="button"
              onClick={() => onSoloPropioChange(true)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5",
                soloPropio
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserCheck className="size-3.5" />
              Mis Arqueos
            </button>
          </div>
        )}

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8 px-2.5 text-xs gap-1.5 border-border/80 hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className="size-3.5" />
            <span className="hidden md:inline">Actualizar</span>
          </Button>
        )}

        <Button
          size="sm"
          onClick={onNewArqueoClick}
          className="h-8 px-3.5 text-xs font-semibold gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xs shadow-amber-500/20 transition-all duration-200 cursor-pointer"
        >
          <Plus className="size-3.5" />
          Nuevo Arqueo
        </Button>
      </div>
    </div>
  );
}
