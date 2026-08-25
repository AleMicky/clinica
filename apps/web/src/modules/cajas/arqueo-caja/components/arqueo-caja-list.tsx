"use client";

import * as React from "react";
import {
  Calculator,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Vault,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CreditCard,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput, DataTablePagination } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { ArqueoCajaResponse } from "../types/arqueo-caja.types";

interface ArqueoCajaListProps {
  arqueos: ArqueoCajaResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedFilter: "TODOS" | "CUADRADOS" | "DIFERENCIA";
  onFilterChange: (filter: "TODOS" | "CUADRADOS" | "DIFERENCIA") => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (arqueo: ArqueoCajaResponse) => void;
  onDelete: (arqueo: ArqueoCajaResponse) => void;
}

function formatDatetime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name?: string | null): string {
  if (!name) return "C";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0][0] || "C").toUpperCase();
}

function formatCurrency(val?: number | null): string {
  return `Bs. ${Number(val || 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ArqueoCajaList({
  arqueos,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  selectedFilter,
  onFilterChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: ArqueoCajaListProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const tabs: Array<{
    key: "TODOS" | "CUADRADOS" | "DIFERENCIA";
    label: string;
    activeClasses: string;
  }> = [
    {
      key: "TODOS",
      label: "Todos los Arqueos",
      activeClasses: "bg-primary text-primary-foreground shadow-xs",
    },
    {
      key: "CUADRADOS",
      label: "Cuadres Exactos",
      activeClasses: "bg-emerald-600 text-white shadow-xs",
    },
    {
      key: "DIFERENCIA",
      label: "Con Diferencias",
      activeClasses: "bg-amber-600 text-white shadow-xs",
    },
  ];

  return (
    <div className="space-y-3 w-full">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-0.5">
        {/* Badges de Filtro Interactivo */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((t) => {
            const isActive = selectedFilter === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onFilterChange(t.key)}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer select-none",
                  isActive
                    ? t.activeClasses
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Buscador */}
        <div className="w-full sm:w-72">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por cajero, caja, turno, ID..."
            className="h-8 text-xs bg-background"
          />
        </div>
      </div>

      {/* Listado en Formato Tarjetas */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border/60 bg-card space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-6 w-28 rounded-md" />
              </div>
              <Skeleton className="h-4 w-72 rounded-md" />
            </div>
          ))}
        </div>
      ) : arqueos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border-2 border-dashed border-border/70 bg-card/50 space-y-3">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <Calculator className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              No se encontraron arqueos de caja
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchTerm
                ? `No hay resultados para la búsqueda "${searchTerm}".`
                : "No hay arqueos o conciliaciones registradas bajo el filtro seleccionado."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {arqueos.map((arq) => {
            const turno = arq.turnoCaja;
            const cajero = turno?.empleado?.nombreCompleto || "Cajero no asignado";
            const caja = turno?.caja?.nombre || "Caja Principal";
            const cajaCodigo = turno?.caja?.codigo || "CAJA";
            const initials = getInitials(cajero);
            const diferenciaNum = Number(arq.diferencia || 0);

            const isExacto = Math.abs(diferenciaNum) < 0.001;
            const isFaltante = diferenciaNum < -0.001;
            const isSobrante = diferenciaNum > 0.001;

            return (
              <div
                key={arq.id}
                className={cn(
                  "group p-4 rounded-xl border transition-all shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card",
                  isExacto
                    ? "hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] border-border/60"
                    : isFaltante
                    ? "border-rose-500/30 hover:border-rose-500/50 bg-rose-500/[0.015]"
                    : "border-amber-500/30 hover:border-amber-500/50 bg-amber-500/[0.015]"
                )}
              >
                {/* Bloque Izquierdo: Avatar + Cajero + Caja + Fecha */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border mt-0.5 transition-colors",
                      isExacto
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white"
                        : isFaltante
                        ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20 group-hover:bg-rose-600 group-hover:text-white"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white"
                    )}
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                        {cajero}
                      </span>

                      <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                        {cajaCodigo} · {caja}
                      </span>

                      {turno?.id && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                          #Turno-{turno.id}
                        </span>
                      )}

                      {/* Badge de Conciliación */}
                      {isExacto ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0.2 px-2 font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="size-3" />
                          <span>Cuadre Exacto</span>
                        </Badge>
                      ) : isFaltante ? (
                        <Badge
                          variant="outline"
                          className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px] py-0.2 px-2 font-semibold flex items-center gap-1"
                        >
                          <AlertTriangle className="size-3" />
                          <span>Faltante en Caja</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] py-0.2 px-2 font-semibold flex items-center gap-1"
                        >
                          <AlertTriangle className="size-3" />
                          <span>Sobrante en Caja</span>
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="size-3 text-amber-600 shrink-0" />
                        <span>{formatDatetime(arq.fechaHora)}</span>
                      </span>

                      <span className="text-muted-foreground/40">•</span>

                      <span>
                        {arq.detalles?.length || 0} método{(arq.detalles?.length || 0) !== 1 ? "s" : ""} arqueado{(arq.detalles?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {arq.observacion && (
                      <p className="text-[11px] text-muted-foreground italic line-clamp-1 pt-0.5">
                        "{arq.observacion}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Bloque Central / Derecho: Desglose de Totales & Acciones */}
                <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/40">
                  {/* Totales Conciliados */}
                  <div className="grid grid-cols-3 gap-3 text-left lg:text-right text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider">
                        Esperado
                      </span>
                      <span className="font-mono font-semibold text-foreground text-xs sm:text-sm">
                        {formatCurrency(arq.totalEsperado)}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider">
                        Contado
                      </span>
                      <span className="font-mono font-bold text-foreground text-xs sm:text-sm">
                        {formatCurrency(arq.totalContado)}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9.5px] uppercase font-bold text-muted-foreground block tracking-wider">
                        Diferencia
                      </span>
                      <span
                        className={cn(
                          "font-mono font-black text-xs sm:text-sm",
                          isExacto
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isFaltante
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {diferenciaNum > 0 ? `+${formatCurrency(diferenciaNum)}` : formatCurrency(diferenciaNum)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 pl-2 border-l border-border/40">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(arq)}
                      className="size-7.5 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer rounded-lg"
                      title="Editar arqueo"
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(arq)}
                      className="size-7.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
                      title="Eliminar arqueo"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación Condicional: Solo si hay más de 10 registros */}
      {totalItems > 10 && (
        <div className="pt-2">
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
