"use client";

import { CreditCard } from "lucide-react";

export function CobroHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <span>Gestión de Cobros</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Consulte la relación de cobros procesados por turno de caja, sus métodos de pago y estado de anulación.
        </p>
      </div>
    </div>
  );
}
