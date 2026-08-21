"use client";

import * as React from "react";
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
import type { MetodoPagoResponse } from "../types/metodo-pago.types";

interface MetodoPagoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metodo: MetodoPagoResponse | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function MetodoPagoDeleteDialog({
  open,
  onOpenChange,
  metodo,
  onConfirm,
  isLoading = false,
}: MetodoPagoDeleteDialogProps) {
  if (!metodo) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-border/80 shadow-xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-bold">
            ¿Eliminar método de pago?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Está a punto de dar de baja el método{" "}
            <strong className="text-foreground">"{metodo.nombre}"</strong> (
            <span className="font-mono font-semibold">{metodo.codigo}</span>).
            Esta acción impedirá que se use para nuevos cobros en caja.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="h-8 text-xs cursor-pointer"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault();
              await onConfirm();
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
            ) : null}
            Confirmar Baja
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
