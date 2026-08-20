"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, RefreshCw } from "lucide-react";

interface EmpleadoHeaderProps {
  onAddClick?: () => void;
  onRefresh?: () => void;
}

export function EmpleadoHeader({ onAddClick, onRefresh }: EmpleadoHeaderProps) {
  const router = useRouter();

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      router.push("/recursos-humanos/empleados/nuevo");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-card via-card to-primary/5 px-4 py-2.5 rounded-xl border border-border/70 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="size-8.5 rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-blue-500/20 text-primary flex items-center justify-center border border-primary/20 shadow-2xs shrink-0">
          <Briefcase className="size-4.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground tracking-tight">
              Directorio de Empleados
            </h1>
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.2 rounded-full border border-primary/20">
              Recursos Humanos
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            Administración del personal clínico, cargos y asignaciones por área.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
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
          onClick={handleAddClick}
          className="h-8 px-3.5 text-xs font-semibold gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-xs shadow-primary/20 transition-all duration-200 cursor-pointer"
        >
          <Plus className="size-3.5" />
          Nuevo Empleado
        </Button>
      </div>
    </div>
  );
}