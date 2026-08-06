"use client";

import * as React from "react";
import { ConfirmDeleteDialog } from "@/components/shared";
import type { CargoItem } from "./cargo-table";

interface CargoDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cargo: CargoItem | null;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

export function CargoDeleteDialog({
    open,
    onOpenChange,
    cargo,
    onConfirm,
    isLoading = false,
}: CargoDeleteDialogProps) {
    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="¿Eliminar el cargo seleccionado?"
            itemName={cargo ? `${cargo.nombre} (${cargo.codigo})` : undefined}
            confirmLabel="Eliminar Cargo"
            onConfirm={onConfirm}
            isLoading={isLoading}
        />
    );
}