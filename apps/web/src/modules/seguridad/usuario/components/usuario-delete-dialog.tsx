"use client";

import * as React from "react";
import { ConfirmDeleteDialog } from "@/components/shared";
import type { UsuarioResponse } from "../types/usuario.types";

interface UsuarioDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: UsuarioResponse | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function UsuarioDeleteDialog({
  open,
  onOpenChange,
  usuario,
  onConfirm,
  isLoading = false,
}: UsuarioDeleteDialogProps) {
  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="¿Eliminar el usuario seleccionado?"
      itemName={
        usuario
          ? `@${usuario.userName} (${usuario.email})`
          : undefined
      }
      confirmLabel="Eliminar Usuario"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
