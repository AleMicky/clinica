"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
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
import { useDeleteMedico } from "../hooks/use-medicos";
import type { MedicoResponse } from "../types/medico.types";

interface MedicoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medico: MedicoResponse | null;
}

export function MedicoDeleteDialog({
  open,
  onOpenChange,
  medico,
}: MedicoDeleteDialogProps) {
  const deleteMutation = useDeleteMedico();

  const handleConfirm = async () => {
    if (!medico) return;
    try {
      await deleteMutation.mutateAsync(medico.id);
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  const medicoNombre = medico?.empleado?.nombreCompleto || `Médico #${medico?.id}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Deshabilitar Médico?</AlertDialogTitle>
          <AlertDialogDescription>
            Está a punto de inhabilitar el registro del médico{" "}
            <span className="font-semibold text-foreground">{medicoNombre}</span>{" "}
            (Matrícula: {medico?.matriculaProfesional}). El registro cambiará a estado inactivo pero se mantendrán los historiales médicos y transaccionales.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Inhabilitar Médico
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
