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
import type { CajaResponse } from "../types/caja.types";

interface CajaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caja: CajaResponse | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function CajaDeleteDialog({
  open,
  onOpenChange,
  caja,
  onConfirm,
  isLoading,
}: CajaDeleteDialogProps) {
  if (!caja) return null;

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
                ¿Eliminar Punto de Caja?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs mt-1">
                Esta acción eliminará la caja{" "}
                <span className="font-semibold text-foreground">{caja.nombre}</span> (
                <span className="font-mono text-primary font-medium">{caja.codigo}</span>).
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
