"use client";

import * as React from "react";
import { Layers } from "lucide-react";

export function CategoriaServicioHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/40 pb-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Layers className="size-5 text-primary" />
          Categorías y Servicios
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Catálogo de servicios · Administra las categorías y prestaciones disponibles en la clínica.
        </p>
      </div>
    </div>
  );
}



