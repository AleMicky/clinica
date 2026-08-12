"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Plus, RefreshCw } from "lucide-react";

interface AdmisionHeaderProps {
  onAddClick?: () => void;
  onRefresh?: () => void;
}

export function AdmisionHeader({ onAddClick, onRefresh }: AdmisionHeaderProps) {
  const router = useRouter();

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      router.push("/recepcion/admisiones/nueva");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-card via-card to-primary/5 p-4 rounded-xl border border-border/70 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-blue-500/20 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
          <FileText className="size-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Admisión de Pacientes
            </h1>
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
              Recepción
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registro de ingresos, orden de prestaciones médicas, control de pagos y flujo de atención.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-9 px-3 text-xs gap-1.5 border-border/80 hover:bg-accent hover:text-accent-foreground transition-all"
            title="Actualizar datos"
          >
            <RefreshCw className="size-3.5" />
            <span className="hidden md:inline">Actualizar</span>
          </Button>
        )}

        <Button
          size="sm"
          onClick={handleAddClick}
          className="h-9 px-4 text-xs font-semibold gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200"
        >
          <Plus className="size-4" />
          Nueva Admisión
        </Button>
      </div>
    </div>
  );
}

