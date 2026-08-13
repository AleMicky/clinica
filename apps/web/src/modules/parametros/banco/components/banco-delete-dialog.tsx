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
import type { BancoResponse } from "../types/banco.types";

interface BancoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banco: BancoResponse | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function BancoDeleteDialog({
  open,
  onOpenChange,
  banco,
  onConfirm,
  isLoading = false,
}: BancoDeleteDialogProps) {
  if (!banco) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>¿Eliminar Entidad Bancaria?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2 pt-2">
            <span>
              Está a punto de eliminar el banco <strong>{banco.nombre}</strong> (
              <span className="font-mono">{banco.codigo}</span>).
            </span>
            <br />
            <span className="text-xs text-muted-foreground">
              Esta acción sólo se completará si el banco no posee cuentas bancarias asociadas en el sistema.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Confirmar Eliminación</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
