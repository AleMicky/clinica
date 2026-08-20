"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchInput,
  DataTablePagination,
} from "@/components/shared";
import {
  Pencil,
  Trash2,
  Vault,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CajaResponse } from "../types/caja.types";

interface CajaListProps {
  cajas: CajaResponse[];
  isLoading?: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedStatusTab?: "TODOS" | "ACTIVOS" | "INACTIVOS";
  onStatusTabChange?: (tab: "TODOS" | "ACTIVOS" | "INACTIVOS") => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (caja: CajaResponse) => void;
  onDelete: (caja: CajaResponse) => void;
  onRefresh?: () => void;
}

export function CajaList({
  cajas,
  isLoading = false,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedStatusTab = "TODOS",
  onStatusTabChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onRefresh,
}: CajaListProps) {
  const tabs: Array<{
    key: "TODOS" | "ACTIVOS" | "INACTIVOS";
    label: string;
    icon: React.ReactNode;
    activeClasses: string;
  }> = [
    {
      key: "TODOS",
      label: "Todas",
      icon: <Vault className="size-3" />,
      activeClasses: "bg-primary text-primary-foreground shadow-xs",
    },
    {
      key: "ACTIVOS",
      label: "Activas",
      icon: <CheckCircle2 className="size-3" />,
      activeClasses: "bg-emerald-600 text-white shadow-xs",
    },
    {
      key: "INACTIVOS",
      label: "Inactivas",
      icon: <XCircle className="size-3" />,
      activeClasses: "bg-slate-600 text-white shadow-xs",
    },
  ];

  return (
    <div className="space-y-2.5 w-full">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-0.5">
        {/* Badges de Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((t) => {
            const isActive = selectedStatusTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onStatusTabChange?.(t.key)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? t.activeClasses
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Buscador + Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Buscar por código o nombre..."
              className="h-8 text-xs bg-background shadow-2xs"
            />
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="size-8 text-muted-foreground hover:text-foreground cursor-pointer shrink-0 border-border/80"
              title="Actualizar datos"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Listado de Cajas en Formato Tarjetas Full Width */}
      <div className="space-y-1.5">
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-border/50 bg-card space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        ) : cajas.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-2">
            <Vault className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="font-bold text-xs text-foreground">No se encontraron cajas</p>
            <p className="text-[11px] max-w-xs mx-auto text-muted-foreground">
              {searchTerm
                ? "Ajuste los términos de búsqueda o el filtro de estado."
                : "Agregue un nuevo punto de caja para comenzar."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {cajas.map((caja) => (
              <div
                key={caja.id}
                className="p-3 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-muted/25 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Bloque Izquierdo: Icono + Código + Nombre + Descripción */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                    <Vault className="size-4.5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                        {caja.codigo}
                      </span>
                      <h3 className="font-bold text-xs text-foreground truncate">
                        {caja.nombre}
                      </h3>
                    </div>

                    <p className="text-[11px] text-muted-foreground truncate">
                      {caja.descripcion || "Sin descripción adicional registrada."}
                    </p>
                  </div>
                </div>

                {/* Bloque Derecho: Estado + Acciones */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                  <Badge
                    variant={caja.activo ? "default" : "secondary"}
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                      caja.activo
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {caja.activo ? "Activa" : "Inactiva"}
                  </Badge>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(caja)}
                      className="h-7 px-2.5 text-[11px] font-semibold gap-1 border-border/80 hover:bg-accent hover:text-primary shadow-2xs cursor-pointer"
                      title="Editar caja"
                    >
                      <Pencil className="size-3 text-amber-600" />
                      <span>Editar</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(caja)}
                      className="h-7 px-2 text-[11px] font-semibold gap-1 text-destructive/80 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      title="Eliminar caja"
                    >
                      <Trash2 className="size-3" />
                      <span>Eliminar</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalItems > 10 && (
          <div className="pt-2 px-1">
            <DataTablePagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
