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
  Calculator,
  RefreshCw,
  Calendar,
  Layers,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArqueoCajaResponse } from "../types/arqueo-caja.types";

interface ArqueoCajaListProps {
  arqueos: ArqueoCajaResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (arqueo: ArqueoCajaResponse) => void;
  onDelete: (arqueo: ArqueoCajaResponse) => void;
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

function formatCurrency(val?: number | null): string {
  return `S/ ${Number(val || 0).toFixed(2)}`;
}

export function ArqueoCajaList({
  arqueos,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onRefresh,
}: ArqueoCajaListProps) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-border/60 bg-card p-3 shadow-2xs space-y-2.5">
      {/* Cabecera y Buscador */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/40">
        <div className="flex items-center gap-1.5 min-w-0">
          <Calculator className="size-4 text-primary shrink-0" />
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider truncate">
            Historial de Arqueos
          </h2>
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
            {totalItems}
          </span>
        </div>

        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            title="Actualizar arqueos"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        )}
      </div>

      {/* Buscador */}
      <div className="w-full">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar por observaciones, caja o turno..."
          className="h-7.5 text-xs bg-muted/30 shadow-none border-border/60 focus:bg-background"
        />
      </div>

      {/* Lista de Arqueos con Scroll */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-270px)] min-h-[300px] space-y-1.5 pr-0.5 scrollbar-thin">
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-border/40 bg-card/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        ) : arqueos.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border/60 rounded-lg bg-muted/10 space-y-1.5">
            <Calculator className="size-7 text-muted-foreground/40 mx-auto" />
            <p className="font-semibold text-xs text-foreground">No se encontraron arqueos</p>
            <p className="text-[10px] max-w-[240px] mx-auto text-muted-foreground">
              {searchTerm
                ? "Intente ajustar los términos de búsqueda."
                : "Haga clic en 'Nuevo Arqueo' para registrar una conciliación de caja."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {arqueos.map((arq) => {
              const diff = Number(arq.diferencia);
              const isCuadrado = Math.abs(diff) < 0.01;
              const cajaCodigo = arq.turnoCaja?.caja?.codigo || "CAJA";
              const cajaNombre = arq.turnoCaja?.caja?.nombre || `Turno #${arq.turnoCaja?.id || "-"}`;
              const cajeroNombre = arq.turnoCaja?.empleado?.nombreCompleto;

              return (
                <div
                  key={arq.id}
                  className={`group p-2.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isCuadrado
                      ? "border-border/50 bg-card hover:border-emerald-500/40 hover:bg-muted/30"
                      : "border-amber-500/30 bg-amber-500/[0.02] hover:border-amber-500/50 hover:bg-amber-500/[0.05]"
                  }`}
                >
                  {/* Bloque Izquierdo: Icono + Caja + Cajero + Fechas */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={`size-7.5 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                        isCuadrado
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      <Calculator className="size-3.5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-[10px] px-1 py-0.2 rounded border bg-primary/10 text-primary border-primary/20">
                          {cajaCodigo}
                        </span>

                        <span className="font-bold text-xs text-foreground truncate">
                          {cajaNombre}
                        </span>

                        {cajeroNombre && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                            • {cajeroNombre}
                          </span>
                        )}

                        {arq.detalles && arq.detalles.length > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground font-mono bg-muted/60 px-1 py-0.2 rounded">
                            <Layers className="size-2.5" />
                            <span>{arq.detalles.length} métodos</span>
                          </span>
                        )}
                      </div>

                      {/* Metadatos y Fecha */}
                      <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground flex-wrap pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                          <span>{formatDate(arq.fechaHora)}</span>
                        </span>

                        {arq.observacion && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="truncate max-w-[220px] text-muted-foreground/80 italic">
                              "{arq.observacion}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bloque Central: Montos (Esperado, Contado, Diferencia) */}
                  <div className="flex items-center gap-3 text-xs font-mono shrink-0 px-2 py-1 rounded-md bg-muted/30 border border-border/40">
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-sans">Esperado</p>
                      <p className="font-medium text-foreground">{formatCurrency(arq.totalEsperado)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-sans">Contado</p>
                      <p className="font-medium text-foreground">{formatCurrency(arq.totalContado)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase font-sans">Diferencia</p>
                      <p
                        className={`font-bold ${
                          isCuadrado
                            ? "text-emerald-600 dark:text-emerald-400"
                            : diff > 0
                            ? "text-blue-600"
                            : "text-rose-600"
                        }`}
                      >
                        {formatCurrency(diff)}
                      </p>
                    </div>
                  </div>

                  {/* Bloque Derecho: Badge Estado & Acciones */}
                  <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-border/30">
                    <Badge
                      variant={isCuadrado ? "default" : "secondary"}
                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                        isCuadrado
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {isCuadrado ? "Cuadrado" : "Con Diferencia"}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => onEdit(arq)}
                        className="size-6.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Editar arqueo"
                      >
                        <Pencil className="size-3 text-blue-600" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger className="size-6.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors border border-border/50 cursor-pointer">
                          <MoreVertical className="size-3" />
                          <span className="sr-only">Opciones</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 text-xs">
                          <DropdownMenuLabel className="text-[10px]">Arqueo</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onEdit(arq)}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Pencil className="size-3 text-blue-600" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(arq)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer text-xs"
                          >
                            <Trash2 className="size-3" />
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
      </div>

      {/* Paginación Compacta */}
      {totalItems > 10 && (
        <div className="pt-1 border-t border-border/40">
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
  );
}
