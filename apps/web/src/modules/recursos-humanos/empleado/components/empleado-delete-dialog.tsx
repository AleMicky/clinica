"use client";

import { ConfirmDeleteDialog } from "@/components/shared";
import type { EmpleadoItem } from "./empleado-table";

interface EmpleadoDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    empleado: EmpleadoItem | null;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

export function EmpleadoDeleteDialog({
    open,
    onOpenChange,
    empleado,
    onConfirm,
    isLoading = false,
}: EmpleadoDeleteDialogProps) {
    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title="¿Eliminar el empleado seleccionado?"
            itemName={
                empleado
                    ? `${empleado.nombreCompleto} (${empleado.codigoEmpleado})`
                    : undefined
            }
            confirmLabel="Eliminar Empleado"
            onConfirm={onConfirm}
            isLoading={isLoading}
        />
    );
}