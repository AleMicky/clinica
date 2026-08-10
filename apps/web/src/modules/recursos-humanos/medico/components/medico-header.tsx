"use client";

import * as React from "react";
import { HeartPulse } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface MedicoHeaderProps {
  onAddClick?: () => void;
}

export function MedicoHeader({ onAddClick }: MedicoHeaderProps) {
  return (
    <PageHeader
      title="Cuerpo Médico"
      description="Expediente de médicos, asignación de especialidades y registro de acuerdos comerciales por servicio."
      icon={HeartPulse}
      actionLabel="Nuevo Médico"
      onActionClick={onAddClick}
    />
  );
}
