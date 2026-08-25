"use client";

import { Plus, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TurnoCajaHeaderProps {
  onNewTurnoClick: () => void;
}

export function TurnoCajaHeader({ onNewTurnoClick }: TurnoCajaHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border/50">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <Clock className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Turnos de Caja
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] font-semibold px-2 py-0.5 bg-primary/5 text-primary border-primary/20 gap-1"
              >
                <Layers className="size-3" />
                Operaciones
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Supervisión de jornadas, horarios de apertura y asignación de cajeros responsables.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onNewTurnoClick}
          size="sm"
          className="h-9 px-3.5 gap-2 text-xs font-semibold shadow-sm shadow-primary/20 hover:shadow-md transition-all cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="size-4" />
          <span>Apertura de Turno</span>
        </Button>
      </div>
    </div>
  );
}
