"use client";

import * as React from "react";
import { Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface EspecialidadHeaderProps {
  onAddClick?: () => void;
}

export function EspecialidadHeader({ onAddClick }: EspecialidadHeaderProps) {
  return (
    <PageHeader
      title="Especialidades Médicas"
      description="Catálogo general de especialidades médicas y subespecialidades del personal clínico."
      icon={Stethoscope}
      actionLabel="Agregar Especialidad"
      onActionClick={onAddClick}
    />
  );
}
