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

import type { RolResponse } from "../types/rol.types";

interface RolDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol: RolResponse | null;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function RolDeleteDialog({
  open,
  onOpenChange,
  rol,
  onConfirm,
  isLoading = false,
}: RolDeleteDialogProps) {
  if (!rol) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            <AlertDialogTitle className="text-base font-semibold">
              Eliminar Rol
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm pt-1">
            ¿Está seguro de que desea eliminar el rol{" "}
            <span className="font-semibold text-foreground">
              {rol.name}
            </span>
            ? Esta acción afectará a los usuarios que tengan asignado este rol.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
