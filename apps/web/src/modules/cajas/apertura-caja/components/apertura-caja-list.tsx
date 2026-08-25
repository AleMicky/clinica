"use client";

import * as React from "react";
import {
  Coins,
  Edit,
  Trash2,
  Calendar,
  User,
  Vault,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput, DataTablePagination } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { AperturaCajaResponse } from "../types/apertura-caja.types";

interface AperturaCajaListProps {
  aperturas: AperturaCajaResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedFilter: "TODOS" | "HOY";
  onFilterChange: (filter: "TODOS" | "HOY") => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (apertura: AperturaCajaResponse) => void;
  onDelete: (apertura: AperturaCajaResponse) => void;
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

export function AperturaCajaList({
  aperturas,
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
}: AperturaCajaListProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const tabs: Array<{
    key: "TODOS" | "HOY";
    label: string;
    activeClasses: string;
  }> = [
    {
      key: "TODOS",
      label: "Todas las Aperturas",
      activeClasses: "bg-primary text-primary-foreground shadow-xs",
    },
    {
      key: "HOY",
      label: "Aperturas de Hoy",
      activeClasses: "bg-emerald-600 text-white shadow-xs",
    },
  ];

  return (
    <div className="space-y-3 w-full">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-0.5">
        {/* Badges de filtro */}
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
            placeholder="Buscar por cajero, caja, ID..."
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
      ) : aperturas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border-2 border-dashed border-border/70 bg-card/50 space-y-3">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <Coins className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              No se encontraron registros de apertura
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchTerm
                ? `No hay resultados para la búsqueda "${searchTerm}".`
                : "No hay fondos iniciales de caja registrados bajo el filtro seleccionado."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {aperturas.map((ap) => {
            const turno = ap.turnoCaja;
            const cajero = turno?.empleado?.nombreCompleto || "Cajero no asignado";
            const caja = turno?.caja?.nombre || "Caja Principal";
            const cajaCodigo = turno?.caja?.codigo || "CAJA";
            const initials = getInitials(cajero);
            const montoFormatted = Number(ap.montoInicial || 0).toLocaleString("es-BO", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

            return (
              <div
                key={ap.id}
                className="group p-4 rounded-xl border border-border/60 bg-card hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                {/* Bloque Izquierdo: Avatar + Caja + Cajero + Fecha */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/20 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
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
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="size-3 text-emerald-600 shrink-0" />
                        <span>{formatDatetime(ap.fechaHora)}</span>
                      </span>

                      {ap.creadoPor && (
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="size-3 text-muted-foreground/60 shrink-0" />
                          <span>Registrado por: {ap.creadoPor}</span>
                        </span>
                      )}
                    </div>

                    {ap.observacion && (
                      <p className="text-[11px] text-muted-foreground italic line-clamp-1 pt-0.5">
                        "{ap.observacion}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Bloque Derecho: Monto Inicial + Acciones */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                      Fondo Inicial
                    </span>
                    <span className="text-base sm:text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
                      Bs. {montoFormatted}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(ap)}
                      className="size-7.5 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer rounded-lg"
                      title="Editar registro"
                    >
                      <Edit className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(ap)}
                      className="size-7.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
                      title="Eliminar registro"
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

      {/* Paginación Condicional: Únicamente si hay más de 10 registros */}
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
