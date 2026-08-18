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
  Clock,
  LogOut,
  RefreshCw,
  Calendar,
  User,
  Vault,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EstadoTurnoCaja,
  type TurnoCajaResponse,
} from "../types/turno-caja.types";

export type TurnoCajaEstadoFiltro = "TODOS" | "ABIERTOS" | "CERRADOS";

interface TurnoCajaListProps {
  turnos: TurnoCajaResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedEstadoTab?: TurnoCajaEstadoFiltro;
  onEstadoTabChange?: (tab: TurnoCajaEstadoFiltro) => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (turno: TurnoCajaResponse) => void;
  onCloseTurno: (turno: TurnoCajaResponse) => void;
  onDelete: (turno: TurnoCajaResponse) => void;
  onRefresh?: () => void;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function TurnoCajaList({
  turnos,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedEstadoTab = "TODOS",
  onEstadoTabChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onCloseTurno,
  onDelete,
  onRefresh,
}: TurnoCajaListProps) {
  const tabs: Array<{
    key: TurnoCajaEstadoFiltro;
    label: string;
    activeClasses: string;
  }> = [
    { key: "TODOS", label: "Todos", activeClasses: "bg-primary text-primary-foreground shadow-xs" },
    { key: "ABIERTOS", label: "Abiertos", activeClasses: "bg-emerald-600 text-white shadow-xs" },
    { key: "CERRADOS", label: "Cerrados", activeClasses: "bg-slate-600 text-white shadow-xs" },
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
          <div className="w-full md:w-64">
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Buscar por caja o cajero..."
              className="h-8 text-xs bg-background shadow-2xs"
            />
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 gap-1.5 text-xs px-2.5 shrink-0"
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
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-48" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-20 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : turnos.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border/60 rounded-xl bg-muted/10 space-y-2">
            <Clock className="size-8 text-muted-foreground/40 mx-auto" />
            <p className="font-bold text-xs text-foreground">No se encontraron turnos de caja</p>
            <p className="text-[11px] max-w-xs mx-auto text-muted-foreground">
              {searchTerm
                ? "Intente ajustar los términos de búsqueda o filtros seleccionados."
                : "Comience abriendo un nuevo turno de caja."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {turnos.map((turno) => {
              const isAbierto = turno.estado === EstadoTurnoCaja.Abierto;
              const cajaCodigo = turno.caja?.codigo || "CAJA";
              const cajaNombre = turno.caja?.nombre || "Punto de Caja";
              const empleadoNombre = turno.empleado?.nombreCompleto || "Sin cajero asignado";

              return (
                <div
                  key={turno.id}
                  className="group p-3 rounded-xl border border-border/50 bg-card hover:border-primary/40 hover:bg-muted/25 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
                >
                  {/* Bloque Izquierdo: Icono + Caja + Cajero + Fechas */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Badge Icono / Avatar */}
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border mt-0.5 transition-colors ${
                        isAbierto
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white"
                          : "bg-muted text-muted-foreground border-border group-hover:bg-primary group-hover:text-primary-foreground"
                      }`}
                    >
                      <Clock className="size-4.5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 flex items-center gap-1">
                          <Vault className="size-3 text-primary/70" />
                          {cajaCodigo}
                        </span>

                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {cajaNombre}
                        </span>

                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                          <User className="size-3 text-muted-foreground/70 shrink-0" />
                          <span className="truncate">{empleadoNombre}</span>
                        </span>
                      </div>

                      {/* Fechas de Apertura y Cierre */}
                      <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-emerald-600/70 shrink-0" />
                          <span>Apertura: <strong>{formatDate(turno.fechaHoraApertura)}</strong></span>
                        </span>

                        {turno.fechaHoraCierre && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="flex items-center gap-1">
                              <LogOut className="size-3 text-muted-foreground/70 shrink-0" />
                              <span>Cierre: <strong>{formatDate(turno.fechaHoraCierre)}</strong></span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bloque Derecho: Estado & Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                    <Badge
                      variant={isAbierto ? "default" : "secondary"}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isAbierto
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {isAbierto ? "Abierto" : "Cerrado"}
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      {/* Botón directo para Cerrar Turno si está abierto */}
                      {isAbierto && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onCloseTurno(turno)}
                          className="h-7 px-2.5 text-[11px] font-semibold gap-1 bg-amber-600 hover:bg-amber-700 text-white shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
                          title="Cerrar este turno de caja"
                        >
                          <LogOut className="size-3" />
                          <span>Cerrar Turno</span>
                        </Button>
                      )}

                      {/* Botón Rápido de Edición */}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(turno)}
                        className="h-7 px-2.5 text-[11px] font-medium gap-1 text-foreground hover:bg-accent cursor-pointer"
                        title="Editar detalle del turno"
                      >
                        <Pencil className="size-3 text-blue-600 dark:text-blue-400" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>

                      {/* Menú desplegable de opciones */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="size-7 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors border border-border/60 cursor-pointer">
                          <MoreVertical className="size-3.5" />
                          <span className="sr-only">Más opciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 text-xs">
                          <DropdownMenuLabel className="text-[11px]">Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {isAbierto && (
                            <DropdownMenuItem
                              onClick={() => onCloseTurno(turno)}
                              className="gap-2 text-amber-600 dark:text-amber-400 font-medium cursor-pointer"
                            >
                              <LogOut className="size-3.5" />
                              <span>Cerrar Turno</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onEdit(turno)}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil className="size-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Editar Detalle</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(turno)}
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
