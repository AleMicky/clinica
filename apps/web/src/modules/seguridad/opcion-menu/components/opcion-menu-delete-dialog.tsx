"use client";

import * as React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import type {
  OpcionMenuResponse,
  OpcionMenuTreeResponse,
} from "../types/opcion-menu.types";

interface OpcionMenuDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opcion: OpcionMenuResponse | OpcionMenuTreeResponse | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function OpcionMenuDeleteDialog({
  open,
  onOpenChange,
  opcion,
  onConfirm,
  isLoading = false,
}: OpcionMenuDeleteDialogProps) {
  if (!opcion) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20 shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-base font-bold text-foreground">
                ¿Eliminar Opción de Menú?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground mt-0.5">
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="my-3 p-3.5 bg-muted/40 border border-border/70 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              {opcion.nombre}
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {opcion.codigo}
            </Badge>
          </div>
          {opcion.ruta && (
            <p className="text-[11px] font-mono text-muted-foreground">
              Ruta: {opcion.ruta}
            </p>
          )}
          <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            ⚠️ <strong>Importante:</strong> Si esta opción contiene submenús o está asignada a uno o más roles, no se permitirá su eliminación hasta que sea desvinculada.
          </p>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={isLoading}
            className="h-8.5 text-xs font-medium cursor-pointer"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="h-8.5 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-1.5 cursor-pointer shadow-xs shadow-destructive/20"
          >
            <Trash2 className="size-3.5" />
            <span>{isLoading ? "Eliminando..." : "Eliminar Opción"}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
