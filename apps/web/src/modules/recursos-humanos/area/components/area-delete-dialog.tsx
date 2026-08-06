"use client";

import * as React from "react";
import { ConfirmDeleteDialog } from "@/components/shared";
import type { AreaItem } from "./area-table";

interface AreaDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    area: AreaItem | null;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

export function AreaDeleteDialog({
    open,
    onOpenChange,
    area,
    onConfirm,
    isLoading = false,
}: AreaDeleteDialogProps) {
    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="¿Eliminar el área seleccionada?"
            itemName={area ? `${area.nombre} (${area.codigo})` : undefined}
            confirmLabel="Eliminar Área"
            onConfirm={onConfirm}
            isLoading={isLoading}
        />
    );
}