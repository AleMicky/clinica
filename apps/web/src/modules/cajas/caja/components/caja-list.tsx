"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SearchInput,
  DataTablePagination,
} from "@/components/shared";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Vault,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CajaResponse } from "../types/caja.types";

export type CajaEstadoFiltro = "TODOS" | "ACTIVAS" | "INACTIVAS";

interface CajaListProps {
  cajas: CajaResponse[];
  selectedCajaId?: number | null;
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedEstadoTab?: CajaEstadoFiltro;
  onEstadoTabChange?: (tab: CajaEstadoFiltro) => void;
  onSelectCaja?: (caja: CajaResponse) => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (caja: CajaResponse) => void;
  onDelete: (caja: CajaResponse) => void;
  onRefresh?: () => void;
}

export function CajaList({
  cajas,
  selectedCajaId,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedEstadoTab = "TODOS",
  onEstadoTabChange,
  onSelectCaja,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onRefresh,
}: CajaListProps) {
  const tabs: Array<{
    key: CajaEstadoFiltro;
    label: string;
    activeClasses: string;
  }> = [
    { key: "TODOS", label: "Todas", activeClasses: "bg-primary text-primary-foreground shadow-xs" },
    { key: "ACTIVAS", label: "Activas", activeClasses: "bg-emerald-600 text-white shadow-xs" },
    { key: "INACTIVAS", label: "Inactivas", activeClasses: "bg-slate-600 text-white shadow-xs" },
  ];

  return (
    <div className="space-y-2.5 w-full">
      {/* FILTROS EN FORMATO BADGE Y BUSCADOR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 px-0.5">
        {/* Badges interactivos de estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((t) => {
            const isActive = selectedEstadoTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onEstadoTabChange?.(t.key)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? t.activeClasses
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Buscador y Actualizar */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="w-full md:w-56">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Buscar caja..."
              className="h-8 text-xs bg-background shadow-2xs"
            />
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 gap-1.5 text-xs px-2.5 shrink-0 cursor-pointer"
              title="Actualizar lista"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          )}
        </div>
      </div>

      {/* CONTENIDO DEL LISTADO */}
      <div className="space-y-1.5">
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-border/50 bg-card space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-44" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3.5 w-20 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : cajas.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-2">
            <Vault className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="font-bold text-xs text-foreground">No se encontraron puntos de caja</p>
            <p className="text-[11px] max-w-xs mx-auto text-muted-foreground">
              {searchTerm
                ? "Intente ajustar los términos de búsqueda o filtros seleccionados."
                : "Comience creando un nuevo punto de caja."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {cajas.map((caja) => {
              const isSelected = selectedCajaId === caja.id;
              return (
                <div
                  key={caja.id}
                  onClick={() => onSelectCaja?.(caja)}
                  className={`group p-3 rounded-xl border transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative cursor-pointer ${
                    isSelected
                      ? "border-primary/80 bg-primary/5 ring-1 ring-primary/40 shadow-xs"
                      : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/25"
                  }`}
                >
                  {/* Bloque Izquierdo: Icono + Código + Nombre + Descripción */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Badge Icono / Avatar */}
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground"
                      }`}
                    >
                      <Vault className="size-4.5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                          {caja.codigo}
                        </span>

                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {caja.nombre}
                        </span>
                      </div>

                      {/* Descripción y metadatos */}
                      <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                        <span className="truncate max-w-[280px]">
                          {caja.descripcion || "Sin descripción asignada"}
                        </span>

                        {caja.fechaCreacion && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                              <span>
                                {new Date(caja.fechaCreacion).toLocaleDateString("es-ES", {
                                  dateStyle: "short",
                                })}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bloque Derecho: Estado & Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                    <Badge
                      variant={caja.activo ? "default" : "secondary"}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        caja.activo
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {caja.activo ? "Activa" : "Inactiva"}
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      {/* Botón Rápido de Edición */}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(caja);
                        }}
                        className="h-7 px-2.5 text-[11px] font-medium gap-1 text-foreground hover:bg-accent cursor-pointer"
                      >
                        <Pencil className="size-3 text-amber-600 dark:text-amber-400" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>

                      {/* Menú desplegable de opciones */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="size-7 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors border border-border/60 cursor-pointer"
                        >
                          <MoreVertical className="size-3.5" />
                          <span className="sr-only">Más opciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 text-xs">
                          <DropdownMenuLabel className="text-[11px]">Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(caja);
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil className="size-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(caja);
                            }}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINACIÓN: Solo se muestra si hay más de 10 registros */}
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
