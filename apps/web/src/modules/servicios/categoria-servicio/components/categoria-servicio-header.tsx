"use client";

import * as React from "react";
import { Layers } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface CategoriaServicioHeaderProps {
  onAddClick?: () => void;
}

export function CategoriaServicioHeader({ onAddClick }: CategoriaServicioHeaderProps) {
  return (
    <PageHeader
      title="Categorías de Servicios"
      description="Clasificación estructural para servicios médicos, consultas, procedimientos y cirugías."
      icon={Layers}
      actionLabel="Nueva Categoría"
      onActionClick={onAddClick}
    />
  );
}
