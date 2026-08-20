"use client";

import * as React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
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
import type { EspecialidadResponse } from "../types/especialidad.types";

interface EspecialidadDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  especialidad: EspecialidadResponse | null;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function EspecialidadDeleteDialog({
  open,
  onOpenChange,
  especialidad,
  onConfirm,
  isLoading = false,
}: EspecialidadDeleteDialogProps) {
  if (!especialidad) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            <AlertDialogTitle className="text-base font-semibold">
              Eliminar Especialidad
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs pt-1">
            ¿Está seguro de que desea eliminar la especialidad{" "}
            <span className="font-semibold text-foreground">
              {especialidad.nombre} ({especialidad.codigo})
            </span>
            ? Esta acción no se puede deshacer si tiene médicos vinculados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-2 gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isLoading} className="h-8 text-xs">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            Confirmar Eliminación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
