"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { MonedaItem } from "./moneda-table";

interface MonedaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moneda: MonedaItem | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function MonedaDeleteDialog({
  open,
  onOpenChange,
  moneda,
  onConfirm,
  isLoading = false,
}: MonedaDeleteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 className="size-5 text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-base font-semibold">
            ¿Eliminar la divisa seleccionada?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            Está a punto de eliminar la moneda{" "}
            <span className="font-semibold text-foreground">
              {moneda?.nombre} ({moneda?.codigo})
            </span>
            . Esta acción eliminará el registro de la divisa del sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            Eliminar Moneda
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
