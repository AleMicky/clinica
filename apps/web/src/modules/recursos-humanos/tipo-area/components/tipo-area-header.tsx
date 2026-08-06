"use client";

import * as React from "react";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface TipoAreaHeaderProps {
    onAddClick?: () => void;
}

export function TipoAreaHeader({ onAddClick }: TipoAreaHeaderProps) {
    return (
        <PageHeader
            title="Tipos de Área"
            description="Clasificación de áreas organizacionales del recurso humano."
            icon={Building2}
            actionLabel="Agregar Tipo de Área"
            onActionClick={onAddClick}
        />
    );
}