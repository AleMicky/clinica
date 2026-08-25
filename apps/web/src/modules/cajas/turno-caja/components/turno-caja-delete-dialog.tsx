"use client";

import { AlertTriangle, Loader2, Vault, User, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TurnoCajaResponse } from "../types/turno-caja.types";

interface TurnoCajaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turno: TurnoCajaResponse | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TurnoCajaDeleteDialog({
  open,
  onOpenChange,
  turno,
  onConfirm,
  isLoading,
}: TurnoCajaDeleteDialogProps) {
  if (!turno) return null;

  const cajaNombre = turno.caja ? `${turno.caja.codigo} - ${turno.caja.nombre}` : `#${turno.id}`;
  const cajeroNombre = turno.empleado?.nombreCompleto || "Empleado";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[440px] p-6">
        <AlertDialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shrink-0 border border-destructive/20 shadow-xs">
              <AlertTriangle className="size-5.5" />
            </div>
            <div>
              <AlertDialogTitle className="text-base font-bold text-foreground">
                ¿Eliminar Registro de Turno?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground mt-0.5">
                Esta acción eliminará permanentemente este registro del historial.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Resumen del Turno a Eliminar */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2 text-xs mt-2">
          <div className="flex items-center gap-2">
            <Vault className="size-3.5 text-primary" />
            <span className="text-muted-foreground">Caja:</span>
            <span className="font-semibold text-foreground">{cajaNombre}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="size-3.5 text-primary" />
            <span className="text-muted-foreground">Cajero:</span>
            <span className="font-semibold text-foreground truncate">{cajeroNombre}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Apertura:</span>
            <span className="font-mono text-foreground font-medium">
              {formatDate(turno.fechaHoraApertura)}
            </span>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
          <AlertDialogCancel disabled={isLoading} className="h-9 text-xs cursor-pointer">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="h-9 text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2 cursor-pointer shadow-xs"
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            <span>Confirmar Eliminación</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
