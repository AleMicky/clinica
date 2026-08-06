"use client";

import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface EmpleadoHeaderProps {
    onAddClick?: () => void;
}

export function EmpleadoHeader({ onAddClick }: EmpleadoHeaderProps) {
    return (
        <PageHeader
            title="Empleados"
            description="Administración del personal clínico registrado como empleados."
            icon={Users}
            actionLabel="Agregar Empleado"
            onActionClick={onAddClick}
        />
    );
}