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
import type { CatalogoGrupoResponse } from "../types/catalogo.types";

interface CatalogoGrupoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupo: CatalogoGrupoResponse | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function CatalogoGrupoDeleteDialog({
  open,
  onOpenChange,
  grupo,
  onConfirm,
  isLoading,
}: CatalogoGrupoDeleteDialogProps) {
  if (!grupo) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[440px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-base">
                ¿Eliminar Catálogo?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs mt-1">
                Está a punto de eliminar el catálogo{" "}
                <span className="font-semibold text-foreground">{grupo.nombre}</span> (
                <span className="font-mono">{grupo.codigo}</span>).
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border mt-2">
          Esta acción removerá la estructura de la tabla maestra. Verifique que no existan registros activos vinculados a este catálogo.
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            Confirmar Eliminación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
