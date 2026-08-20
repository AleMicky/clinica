"use client";

import * as React from "react";
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
import type { PacienteResponse } from "../types/paciente.types";
import { getPacienteFullName } from "./paciente-list";

interface PacienteDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: PacienteResponse | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function PacienteDeleteDialog({
  open,
  onOpenChange,
  paciente,
  onConfirm,
  isLoading = false,
}: PacienteDeleteDialogProps) {
  if (!paciente) return null;

  const nombreCompleto = getPacienteFullName(paciente);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-3">
          <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="size-5" />
          </div>
          <AlertDialogTitle className="text-base font-bold">
            ¿Desactivar expediente del paciente?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Se dará de baja a{" "}
            <strong className="text-foreground">{nombreCompleto}</strong> con Historia Clínica{" "}
            <strong className="font-mono text-primary">{paciente.numeroHistoriaClinica}</strong>. El
            paciente no aparecerá en búsquedas activas pero se conservará su historial de atenciones.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel disabled={isLoading} className="h-9 text-xs font-semibold">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="h-9 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            Confirmar Desactivación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
