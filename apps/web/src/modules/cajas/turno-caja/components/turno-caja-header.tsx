"use client";

import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TurnoCajaHeaderProps {
  onOpenTurnoClick: () => void;
}

export function TurnoCajaHeader({ onOpenTurnoClick }: TurnoCajaHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8.5 w-8.5 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl leading-none">
            Turnos de Caja
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control de apertura, operatividad y cierre de turnos de cajero
          </p>
        </div>
      </div>

      <Button onClick={onOpenTurnoClick} className="h-8.5 gap-1.5 text-xs font-medium px-3 shrink-0">
        <Plus className="h-3.5 w-3.5" />
        <span>Abrir Nuevo Turno</span>
      </Button>
    </div>
  );
}
