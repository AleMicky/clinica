"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  ListTree,
  Plus,
  RefreshCw,
  Table as TableIcon,
  FolderTree,
} from "lucide-react";

export type ViewMode = "tree" | "table";

interface OpcionMenuHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNew: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function OpcionMenuHeader({
  viewMode,
  onViewModeChange,
  onNew,
  onRefresh,
  isRefreshing = false,
}: OpcionMenuHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-card via-card to-primary/5 px-4 py-3 rounded-xl border border-border/70 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-blue-500/20 text-primary flex items-center justify-center border border-primary/20 shadow-2xs shrink-0">
          <ListTree className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              Opciones de Menú
            </h1>
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
              Seguridad
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Administración jerárquica de la navegación, accesos directos, módulos e iconos del sistema.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap shrink-0">
        {/* Toggle View Mode */}
        <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60">
          <Button
            type="button"
            variant={viewMode === "tree" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("tree")}
            className={`h-7 px-2.5 text-xs font-medium gap-1.5 cursor-pointer rounded-md ${
              viewMode === "tree" ? "shadow-2xs bg-background text-foreground" : "text-muted-foreground"
            }`}
          >
            <FolderTree className="size-3.5" />
            <span>Árbol</span>
          </Button>

          <Button
            type="button"
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("table")}
            className={`h-7 px-2.5 text-xs font-medium gap-1.5 cursor-pointer rounded-md ${
              viewMode === "table" ? "shadow-2xs bg-background text-foreground" : "text-muted-foreground"
            }`}
          >
            <TableIcon className="size-3.5" />
            <span>Tabla</span>
          </Button>
        </div>

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 px-2.5 text-xs gap-1.5 border-border/80 hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        )}

        <Button
          size="sm"
          onClick={onNew}
          className="h-8 px-3.5 text-xs font-semibold gap-1.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-xs shadow-primary/20 transition-all duration-200 cursor-pointer"
        >
          <Plus className="size-3.5" />
          Nueva Opción
        </Button>
      </div>
    </div>
  );
}
