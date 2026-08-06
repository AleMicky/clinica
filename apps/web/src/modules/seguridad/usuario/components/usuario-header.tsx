"use client";

import * as React from "react";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface UsuarioHeaderProps {
  onAddClick?: () => void;
}

export function UsuarioHeader({ onAddClick }: UsuarioHeaderProps) {
  return (
    <PageHeader
      title="Gestión de Usuarios"
      description="Administración de credenciales de acceso, asignación de roles y estados de cuenta."
      icon={Users}
      actionLabel="Nuevo Usuario"
      onActionClick={onAddClick}
    />
  );
}
