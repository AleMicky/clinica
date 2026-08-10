"use client";

import { UserCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AsignacionEmpleadoHeaderProps {
    onAddClick: () => void;
}

export function AsignacionEmpleadoHeader({
    onAddClick,
}: AsignacionEmpleadoHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-4 sm:p-5 rounded-xl shadow-xs">
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <UserCheck className="size-5" />
                </div>
                <div>
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                        Asignaciones de Personal
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Gestión de transferencias, cargos y áreas asignadas a empleados
                    </p>
                </div>
            </div>

            <Button
                onClick={onAddClick}
                className="gap-2 shrink-0 cursor-pointer shadow-xs"
                size="sm"
            >
                <Plus className="size-4" />
                <span>Nueva Asignación</span>
            </Button>
        </div>
    );
}
