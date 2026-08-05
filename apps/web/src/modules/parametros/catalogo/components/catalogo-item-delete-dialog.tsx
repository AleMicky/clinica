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
import type { CatalogoItemResponse } from "../types/catalogo.types";

interface CatalogoItemDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: CatalogoItemResponse | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function CatalogoItemDeleteDialog({
  open,
  onOpenChange,
  item,
  onConfirm,
  isLoading,
}: CatalogoItemDeleteDialogProps) {
  if (!item) return null;

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
                ¿Eliminar Ítem del Catálogo?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs mt-1">
                Está a punto de eliminar el elemento{" "}
                <span className="font-semibold text-foreground">{item.nombre}</span> (
                <span className="font-mono">{item.valor}</span>).
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

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
