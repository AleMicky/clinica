"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/shared";
import { useDeletePartidaInventario } from "../hooks/use-partida-inventario";
import type { PartidaInventarioResponse } from "../types/partida-inventario.types";
import { getApiErrorMessage } from "@/lib/api/api-error";

interface PartidaInventarioDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partidaToDelete?: PartidaInventarioResponse | null;
  onSuccessCallback?: () => void;
}

export function PartidaInventarioDeleteDialog({
  open,
  onOpenChange,
  partidaToDelete,
  onSuccessCallback,
}: PartidaInventarioDeleteDialogProps) {
  const deleteMutation = useDeletePartidaInventario();

  const handleConfirmDelete = async () => {
    if (!partidaToDelete) return;
    try {
      await deleteMutation.mutateAsync(partidaToDelete.id);
      toast.success(
        `Partida ${partidaToDelete.numeroPartida ? `"${partidaToDelete.numeroPartida}"` : `#${partidaToDelete.id}`} eliminada correctamente.`
      );
      onSuccessCallback?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const displayName = partidaToDelete?.numeroPartida
    ? `la partida "${partidaToDelete.numeroPartida}"`
    : `la partida #${partidaToDelete?.id ?? ""}`;

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleConfirmDelete}
      title="¿Eliminar partida de inventario?"
      description={`Esta acción eliminará el registro de ${displayName}. Verifique que no existan movimientos o dependencias asociadas a esta partida.`}
      isLoading={deleteMutation.isPending}
    />
  );
}
