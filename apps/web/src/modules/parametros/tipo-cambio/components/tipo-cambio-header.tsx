"use client";

import * as React from "react";
import { TrendingUp, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";

interface TipoCambioHeaderProps {
  onAddClick?: () => void;
  onRefreshClick?: () => void;
  isLoading?: boolean;
}

export function TipoCambioHeader({
  onAddClick,
  onRefreshClick,
  isLoading = false,
}: TipoCambioHeaderProps) {
  return (
    <PageHeader
      title="Tipo de Cambio y Cotizaciones"
      description="Registro diario de tasas de conversión para transacciones financieras, presupuestos y cobranzas."
      icon={TrendingUp}
      actionLabel="Nuevo Tipo de Cambio"
      onActionClick={onAddClick}
    >
      {onRefreshClick && (
        <Button
          variant="outline"
          onClick={onRefreshClick}
          disabled={isLoading}
          className="gap-2 cursor-pointer"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Actualizar Cotizaciones</span>
        </Button>
      )}
    </PageHeader>
  );
}
