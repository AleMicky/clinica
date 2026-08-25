"use client";

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
import { Loader2 } from "lucide-react";
import type { AperturaCajaResponse } from "../types/apertura-caja.types";

interface AperturaCajaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apertura: AperturaCajaResponse | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function AperturaCajaDeleteDialog({
  open,
  onOpenChange,
  apertura,
  onConfirm,
  isLoading,
}: AperturaCajaDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar apertura de caja?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará el registro del saldo inicial de{" "}
            <strong>Bs. {Number(apertura?.montoInicial || 0).toLocaleString("es-BO", { minimumFractionDigits: 2 })}</strong>.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="cursor-pointer">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
