"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AsignacionEmpleadoResponse } from "../types/asignacion-empleado.types";

interface AsignacionEmpleadoDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asignacion: AsignacionEmpleadoResponse | null;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function AsignacionEmpleadoDeleteDialog({
    open,
    onOpenChange,
    asignacion,
    onConfirm,
    isLoading = false,
}: AsignacionEmpleadoDeleteDialogProps) {
    if (!asignacion) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-6">
                <DialogHeader className="space-y-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <AlertTriangle className="size-5" />
                    </div>
                    <DialogTitle className="text-lg font-bold">
                        ¿Eliminar Asignación?
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Esta acción marcará como eliminada la asignación de{" "}
                        <span className="font-semibold text-foreground">
                            {asignacion.empleado?.nombreCompleto || "Empleado"}
                        </span>{" "}
                        en el área{" "}
                        <span className="font-semibold text-foreground">
                            {asignacion.area?.nombre || "—"}
                        </span>.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="text-xs cursor-pointer"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="text-xs gap-1.5 cursor-pointer"
                    >
                        {isLoading && (
                            <Loader2 className="size-3.5 animate-spin" />
                        )}
                        Eliminar Asignación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
