"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
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
      <AlertDialogContent className="sm:max-w-[420px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-base">
                ¿Eliminar Registro de Turno?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs mt-1">
                Se eliminará el turno asignado a{" "}
                <span className="font-semibold text-foreground">{cajeroNombre}</span> en la caja{" "}
                <span className="font-mono text-primary font-medium">{cajaNombre}</span>.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
          <AlertDialogCancel disabled={isLoading} className="h-9 text-xs">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="h-9 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            <span>Confirmar Eliminación</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
