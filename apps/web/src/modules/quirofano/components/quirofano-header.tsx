"use client";

import * as React from "react";
import { Activity, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuirofanoHeaderProps {
  onNewCirugiaClick: () => void;
  onRefreshClick: () => void;
  isRefreshing?: boolean;
}

export function QuirofanoHeader({
  onNewCirugiaClick,
  onRefreshClick,
  isRefreshing = false,
}: QuirofanoHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-2xs">
          <Activity className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Bloque Quirúrgico y Cirugías
            </h1>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-500/30">
              Quirófano & Almacén
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Programación de salas, equipo quirúrgico, hoja de gasto de materiales y descuento de inventario en Quirófano (ALM-QUI).
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefreshClick}
          disabled={isRefreshing}
          className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
        >
          <RefreshCw
            className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onNewCirugiaClick}
          className="h-8 text-xs gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-medium cursor-pointer shadow-2xs"
        >
          <Plus className="size-3.5" />
          <span>Programar Cirugía</span>
        </Button>
      </div>
    </div>
  );
}
