"use client";

import * as React from "react";
import { Handshake } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface ConvenioHeaderProps {
  onAddClick?: () => void;
}

export function ConvenioHeader({ onAddClick }: ConvenioHeaderProps) {
  return (
    <PageHeader
      title="Convenios Institucionales"
      description="Gestión de acuerdos con aseguradoras, empresas privadas e instituciones médicas."
      icon={Handshake}
      actionLabel="Nuevo Convenio"
      onActionClick={onAddClick}
    />
  );
}
