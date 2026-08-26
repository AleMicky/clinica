"use client";

import * as React from "react";
import { Search, RotateCcw, ShieldAlert, FolderTree } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarLoadingSkeleton() {
  return (
    <div className="space-y-4 px-1 py-1">
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-16 bg-sidebar-accent/60 mb-2" />
        <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent/50" />
        <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent/50" />
      </div>
      <div className="space-y-1.5 pt-2">
        <Skeleton className="h-3 w-24 bg-sidebar-accent/60 mb-2" />
        <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent/50" />
        <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent/50" />
        <Skeleton className="h-8 w-full rounded-md bg-sidebar-accent/50" />
      </div>
    </div>
  );
}

interface SidebarErrorProps {
  onRetry: () => void;
}

export function SidebarError({ onRetry }: SidebarErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
        <ShieldAlert className="size-5" />
      </div>
      <p className="text-xs font-semibold text-sidebar-foreground">Error al cargar el menú</p>
      <p className="text-[11px] text-muted-foreground mt-1 mb-3">
        No se pudieron obtener los permisos del usuario.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground border border-sidebar-border transition-colors cursor-pointer"
      >
        <RotateCcw className="size-3" />
        <span>Reintentar</span>
      </button>
    </div>
  );
}

export function SidebarSearchEmpty({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <Search className="size-8 text-muted-foreground/40 mb-2" />
      <p className="text-xs font-semibold text-sidebar-foreground">Sin resultados</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">
        No hay módulos que coincidan con &ldquo;{searchQuery}&rdquo;
      </p>
    </div>
  );
}

export function SidebarEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <FolderTree className="size-8 text-muted-foreground/40 mb-2" />
      <p className="text-xs font-semibold text-sidebar-foreground">Menú no asignado</p>
      <p className="text-[11px] text-muted-foreground mt-1">
        Tu rol actual no tiene opciones de menú configuradas o activas.
      </p>
    </div>
  );
}
