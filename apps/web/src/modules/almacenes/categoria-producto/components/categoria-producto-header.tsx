"use client";

import * as React from "react";
import { FolderTree, Layers, GitFork } from "lucide-react";

interface CategoriaProductoHeaderProps {
  totalCount?: number;
  rootCount?: number;
  subCount?: number;
}

export function CategoriaProductoHeader({
  totalCount = 0,
  rootCount = 0,
  subCount = 0,
}: CategoriaProductoHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-border/40 pb-3.5">
      <div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
            <FolderTree className="size-4.5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground leading-none">
              Categorías de Producto
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Estructura jerárquica para organizar y clasificar los productos del inventario.
            </p>
          </div>
        </div>
      </div>

      {/* Quick KPI badges */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/50 text-[11px] font-medium text-muted-foreground">
            <Layers className="size-3.5 text-primary" />
            <span>Total:</span>
            <span className="font-bold text-foreground font-mono">{totalCount}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/50 text-[11px] font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>Raíces:</span>
            <span className="font-bold text-foreground font-mono">{rootCount}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/50 text-[11px] font-medium text-muted-foreground">
            <GitFork className="size-3.5 text-primary/80" />
            <span>Subcategorías:</span>
            <span className="font-bold text-foreground font-mono">{subCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
