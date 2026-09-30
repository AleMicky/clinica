"use client";

import * as React from "react";
import { Tag } from "lucide-react";

export function MarcaHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/40 pb-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Tag className="size-5 text-primary" />
          Marcas
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Gestión de marcas · Administra los laboratorios, marcas comerciales y fabricantes de los productos.
        </p>
      </div>
    </div>
  );
}
