"use client";

import * as React from "react";
import { Loader2, Trash2, type LucideIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  itemName?: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
  size?: "default" | "sm" | "md" | "lg";
  className?: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "¿Eliminar el registro seleccionado?",
  itemName,
  description,
  icon: Icon = Trash2,
  confirmLabel = "Eliminar Registro",
  onConfirm,
  isLoading = false,
  size,
  className,
}: Readonly<ConfirmDeleteDialogProps>) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  const renderDescription = () => {
    if (description) {
      return description;
    }

    if (itemName) {
      return (
        <span>
          Está a punto de eliminar{" "}
          <strong className="font-semibold text-foreground">{itemName}</strong>. Esta
          acción eliminará el registro del sistema.
        </span>
      );
    }

    return "Esta acción no se puede deshacer. ¿Desea continuar?";
  };

  const effectiveSize = size ?? (description ? "md" : "default");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size={effectiveSize} className={className}>
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <Icon className="size-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <AlertDialogTitle className="text-base font-semibold leading-tight text-foreground">
              {title}
            </AlertDialogTitle>
          </div>
        </div>

        <AlertDialogDescription
          render={<div />}
          className="text-xs text-muted-foreground w-full"
        >
          {renderDescription()}
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2 shrink-0 cursor-pointer"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
