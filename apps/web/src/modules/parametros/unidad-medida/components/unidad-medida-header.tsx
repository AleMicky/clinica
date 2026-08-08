"use client";

import * as React from "react";
import { Scale } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface UnidadMedidaHeaderProps {
  onAddClick?: () => void;
}

export function UnidadMedidaHeader({ onAddClick }: UnidadMedidaHeaderProps) {
  return (
    <PageHeader
      title="Unidades de Medida"
      description="Catálogo de magnitudes, peso, volumen y dosificación farmacológica para recetas y fichas clínicas."
      icon={Scale}
      actionLabel="Nueva Unidad"
      onActionClick={onAddClick}
    />
  );
}
