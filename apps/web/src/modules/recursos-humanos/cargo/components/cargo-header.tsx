"use client";

import * as React from "react";
import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface CargoHeaderProps {
    onAddClick?: () => void;
}

export function CargoHeader({ onAddClick }: CargoHeaderProps) {
    return (
        <PageHeader
            title="Cargos"
            description="Administración de cargos y puestos del personal clínico."
            icon={Briefcase}
            actionLabel="Agregar Cargo"
            onActionClick={onAddClick}
        />
    );
}