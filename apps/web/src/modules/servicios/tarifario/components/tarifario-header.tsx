"use client";

import * as React from "react";
import { Tag } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface TarifarioHeaderProps {
  onAddClick?: () => void;
}

export function TarifarioHeader({ onAddClick }: TarifarioHeaderProps) {
  return (
    <PageHeader
      title="Tarifarios y Precios"
      description="Listas de precios por servicios clínicos, asignación de divisas y periodos de vigencia."
      icon={Tag}
      actionLabel={onAddClick ? "Nuevo Tarifario" : undefined}
      onActionClick={onAddClick}
    />
  );
}
