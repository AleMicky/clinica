"use client";

import * as React from "react";
import { User } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface PersonaHeaderProps {
  onAddClick?: () => void;
}

export function PersonaHeader({ onAddClick }: PersonaHeaderProps) {
  return (
    <PageHeader
      title="Directorio de Personas"
      description="Gestión centralizada de expedientes de personas, datos filiatorios y contacto."
      icon={User}
      actionLabel="Nueva Persona"
      onActionClick={onAddClick}
    />
  );
}
