"use client";

import * as React from "react";
import { ConfirmDeleteDialog } from "@/components/shared";
import type { PersonaResponse } from "../types/persona.types";

interface PersonaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: PersonaResponse | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function PersonaDeleteDialog({
  open,
  onOpenChange,
  persona,
  onConfirm,
  isLoading = false,
}: PersonaDeleteDialogProps) {
  const nombreCompleto = persona
    ? [persona.nombres, persona.apellidoPaterno, persona.apellidoMaterno]
        .filter(Boolean)
        .join(" ")
    : undefined;

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="¿Eliminar la persona seleccionada?"
      itemName={
        persona
          ? `${nombreCompleto} (${persona.tipoDocumento}: ${persona.numeroDocumento})`
          : undefined
      }
      confirmLabel="Eliminar Persona"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
