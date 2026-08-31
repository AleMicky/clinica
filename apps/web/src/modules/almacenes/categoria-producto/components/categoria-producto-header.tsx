"use client";

import * as React from "react";
import { FolderTree } from "lucide-react";

export function CategoriaProductoHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/40 pb-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FolderTree className="size-5 text-primary" />
          Categorías de Producto
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Clasificación de productos · Administra las categorías y subcategorías para organizar el inventario.
        </p>
      </div>
    </div>
  );
}
