"use client";

import * as React from "react";
import { Coins } from "lucide-react";
import { PageHeader } from "@/components/shared";

interface MonedaHeaderProps {
  onAddClick?: () => void;
}

export function MonedaHeader({ onAddClick }: MonedaHeaderProps) {
  return (
    <PageHeader
      title="Monedas y Divisas"
      description="Configuración de monedas operativas, de facturación y moneda principal de contabilidad."
      icon={Coins}
      actionLabel="Agregar Moneda"
      onActionClick={onAddClick}
    />
  );
}
