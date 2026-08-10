"use client";

import * as React from "react";
import { HeartPulse } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface PacienteHeaderProps {
  onAddClick?: () => void;
}

export function PacienteHeader({ onAddClick }: PacienteHeaderProps) {
  return (
    <PageHeader
      title="Gestión de Pacientes"
      description="Registro de expedientes clínicos, historias clínicas y cobertura de convenios."
      icon={HeartPulse}
      actionLabel="Nuevo Paciente"
      onActionClick={onAddClick}
    />
  );
}
