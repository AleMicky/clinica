"use client";

import * as React from "react";
import { Warehouse } from "lucide-react";

export function AlmacenHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/40 pb-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Warehouse className="size-5 text-primary" />
          Almacenes
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Gestión de almacenes · Administra los depósitos y puntos de almacenamiento de la clínica.
        </p>
      </div>
    </div>
  );
}
