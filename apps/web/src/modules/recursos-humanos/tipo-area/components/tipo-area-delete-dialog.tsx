"use client";

import * as React from "react";
import { ConfirmDeleteDialog } from "@/components/shared";
import type { TipoAreaItem } from "./tipo-area-table";

interface TipoAreaDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tipoArea: TipoAreaItem | null;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

export function TipoAreaDeleteDialog({
    open,
    onOpenChange,
    tipoArea,
    onConfirm,
    isLoading = false,
}: TipoAreaDeleteDialogProps) {
    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="¿Eliminar el tipo de área seleccionado?"
            itemName={tipoArea ? `${tipoArea.nombre} (${tipoArea.codigo})` : undefined}
            confirmLabel="Eliminar Tipo de Área"
            onConfirm={onConfirm}
            isLoading={isLoading}
        />
    );
}