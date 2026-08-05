"use client";

import * as React from "react";
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CatalogoHeaderProps {
  onAddGrupoClick: () => void;
}

export function CatalogoHeader({ onAddGrupoClick }: CatalogoHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Database className="size-5 text-primary" />
          Catálogos y Tablas Maestras
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Gestión de catálogos generales, clasificaciones y listas desplegables.
        </p>
      </div>
      <Button onClick={onAddGrupoClick} size="sm" className="shrink-0 gap-1.5 shadow-xs h-8 text-xs font-medium">
        <Plus className="size-3.5" />
        <span>Nuevo Catálogo</span>
      </Button>
    </div>
  );
}
