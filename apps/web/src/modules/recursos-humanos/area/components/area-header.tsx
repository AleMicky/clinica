"use client";

import * as React from "react";
import { Network } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface AreaHeaderProps {
    onAddClick?: () => void;
}

export function AreaHeader({ onAddClick }: AreaHeaderProps) {
    return (
        <PageHeader
            title="Áreas"
            description="Administración de áreas organizacionales y su jerarquía."
            icon={Network}
            actionLabel="Agregar Área"
            onActionClick={onAddClick}
        />
    );
}