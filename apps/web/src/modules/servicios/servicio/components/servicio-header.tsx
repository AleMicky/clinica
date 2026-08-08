"use client";

import * as React from "react";
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface ServicioHeaderProps {
  onAddClick?: () => void;
}

export function ServicioHeader({ onAddClick }: ServicioHeaderProps) {
  return (
    <PageHeader
      title="Servicios / Prestaciones Médicas"
      description="Catálogo general de consultas, cirugías, exámenes y procedimientos ofrecidos por la clínica."
      icon={Activity}
      actionLabel="Nuevo Servicio"
      onActionClick={onAddClick}
    />
  );
}
