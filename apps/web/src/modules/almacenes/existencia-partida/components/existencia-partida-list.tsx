"use client";

import * as React from "react";
import {
  Layers,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Inbox,
  Clock,
  RefreshCw,
  Warehouse,
  Package,
  Calendar,
  CalendarX,
  AlertTriangle,
  DollarSign,
  CalendarCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/shared";
import { cn, formatDate } from "@/lib/utils";
import type { ExistenciaPartidaResponse } from "../types/existencia-partida.types";
import type { AlmacenResponse } from "../../almacen/types/almacen.types";

interface ExistenciaPartidaListProps {
  items: ExistenciaPartidaResponse[];
  almacenes?: AlmacenResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedAlmacenId?: number | null;
  onSearchChange?: (value: string) => void;
  onAlmacenChange?: (almacenId: number | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddPartida?: () => void;
  onEdit?: (item: ExistenciaPartidaResponse) => void;
  onDelete?: (item: ExistenciaPartidaResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (item: ExistenciaPartidaResponse) => void;
  isCompact?: boolean;
}

export function ExistenciaPartidaList({
  items,
  almacenes = [],
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  selectedAlmacenId = null,
  onSearchChange,
  onAlmacenChange,
  onPageChange,
  onPageSizeChange,
  onAddPartida,
  onEdit,
  onDelete,
  onRefresh,
  onViewAudit,
  isCompact = false,
}: ExistenciaPartidaListProps) {
  const getVencimientoBadge = (fechaVencimiento?: string | null) => {
    if (!fechaVencimiento) {
      return (
        <span className="text-muted-foreground/60 text-[11px] flex items-center gap-1">
          <Calendar className="size-3 text-muted-foreground/40" />
          <span>Sin caducidad</span>
        </span>
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = fechaVencimiento.split("-");
    let expDate = new Date(fechaVencimiento);
    if (parts.length === 3) {
      expDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    expDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <Badge
          variant="destructive"
          className="text-[10px] px-2 py-0.5 gap-1 font-medium bg-destructive/15 text-destructive border border-destructive/30"
        >
          <CalendarX className="size-3" />
          <span>Vencido ({formatDate(fechaVencimiento)})</span>
        </Badge>
      );
    }

    if (diffDays <= 30) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 gap-1 font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
        >
          <AlertTriangle className="size-3 text-amber-500" />
          <span>Vence en {diffDays}d</span>
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="text-[10px] px-2 py-0.5 gap-1 font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
      >
        <CalendarCheck className="size-3" />
        <span>Vigente ({formatDate(fechaVencimiento)})</span>
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Controls: Search, Filter & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          {/* Almacen Filter */}
          {almacenes.length > 0 && onAlmacenChange && (
            <select
              value={selectedAlmacenId ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                onAlmacenChange(val ? Number(val) : null);
              }}
              className="h-8 rounded-lg border border-border/60 bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shrink-0"
            >
              <option value="">Todos los almacenes</option>
              {almacenes.map((alm) => (
                <option key={alm.id} value={alm.id}>
                  {alm.nombre}
                </option>
              ))}
            </select>
          )}

          {/* Search bar */}
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por lote, producto o código..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-8 text-xs bg-card border-border/60"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title="Refrescar datos"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            </Button>
          )}

          {onAddPartida && (
            <Button
              size="sm"
              onClick={onAddPartida}
              className="h-8 px-3 text-xs gap-1.5 cursor-pointer shadow-2xs font-medium"
            >
              <Plus className="size-3.5" />
              <span>Asignar Partida</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main List */}
      <div className="flex flex-col gap-2 w-full">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border border-border/60 bg-card rounded-lg p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 w-full md:w-1/3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border/70 rounded-xl bg-card/40 text-center">
            <div className="size-11 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
              <Inbox className="size-6 text-muted-foreground/60" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              No se encontraron partidas en existencia
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {searchTerm || selectedAlmacenId
                ? "No hay resultados que coincidan con los filtros aplicados. Intente ajustar el término de búsqueda."
                : "No hay stock asignado a partidas o lotes en los almacenes registrados."}
            </p>
            {onAddPartida && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddPartida}
                className="mt-4 text-xs h-8 gap-1.5 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Asignar primera partida</span>
              </Button>
            )}
          </div>
        ) : (
          items.map((item) => {
            const isOutOfStock = item.cantidadDisponible <= 0;
            const hasReservations = item.cantidadReservada > 0;
            const valorTotal = item.cantidad * item.costoUnitario;

            return (
              <div
                key={item.id}
                className="group border border-border/60 hover:border-primary/40 bg-card hover:bg-muted/20 rounded-xl px-3.5 py-3 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
              >
                {/* Product & Warehouse Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold",
                      isOutOfStock
                        ? "bg-destructive/10 border-destructive/20 text-destructive"
                        : "bg-primary/10 border-primary/20 text-primary"
                    )}
                  >
                    <Layers className="size-4.5" />
                  </div>

                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.productoCodigo && (
                        <span className="font-mono text-[11px] font-bold text-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border/40 shrink-0">
                          {item.productoCodigo}
                        </span>
                      )}
                      <span className="font-semibold text-xs text-foreground truncate">
                        {item.productoNombre || `Producto #${item.productoId}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-muted/40 px-1.5 py-0.5 rounded border border-border/30">
                        <Warehouse className="size-3 text-muted-foreground" />
                        <span>{item.almacenNombre || `Almacén #${item.almacenId}`}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 bg-primary/5 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-mono font-medium">
                        <Layers className="size-3" />
                        <span>Lote: {item.numeroPartida || `Partida #${item.partidaInventarioId}`}</span>
                      </span>

                      {getVencimientoBadge(item.fechaVencimiento)}
                    </div>
                  </div>
                </div>

                {/* Stock Quantities & Valuation */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/30">
                  <div className="flex items-center gap-2.5">
                    {/* Costo Unitario */}
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Costo Unit.
                      </span>
                      <span className="font-mono font-medium text-xs text-foreground">
                        ${item.costoUnitario.toFixed(2)}
                      </span>
                    </div>

                    {/* Total Físico */}
                    <div className="flex flex-col items-end pl-2 border-l border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Físico
                      </span>
                      <span className="font-mono font-medium text-xs text-foreground">
                        {item.cantidad.toLocaleString()}
                      </span>
                    </div>

                    {/* Reservado */}
                    {hasReservations && (
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          Reservado
                        </span>
                        <span className="font-mono font-medium text-xs text-amber-600 dark:text-amber-400">
                          {item.cantidadReservada.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Disponible */}
                    <div className="flex flex-col items-end pl-2 border-l border-border/40">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Disponible
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono font-bold text-xs px-2 py-0.5",
                          isOutOfStock
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        )}
                      >
                        {item.cantidadDisponible.toLocaleString()}
                      </Badge>
                    </div>

                    {/* Valor Total */}
                    {valorTotal > 0 && (
                      <div className="hidden lg:flex flex-col items-end pl-2 border-l border-border/40">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Valor Lote
                        </span>
                        <span className="font-mono font-semibold text-xs text-primary">
                          ${valorTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Dropdown */}
                  <div className="flex items-center gap-1">
                    {onViewAudit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewAudit(item)}
                        className="h-7 px-2 text-[10px] text-muted-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted border border-border/40 gap-1 cursor-pointer"
                        title="Ver Auditoría"
                      >
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="hidden xl:inline">Auditoría</span>
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex size-6 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground/70 transition-colors cursor-pointer"
                        aria-label="Acciones de partida"
                      >
                        <MoreVertical className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 text-xs">
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(item)}
                            className="cursor-pointer gap-2"
                          >
                            <Edit className="size-3.5" />
                            <span>Modificar Cantidad</span>
                          </DropdownMenuItem>
                        )}
                        {onViewAudit && (
                          <DropdownMenuItem
                            onClick={() => onViewAudit(item)}
                            className="cursor-pointer gap-2"
                          >
                            <Clock className="size-3.5" />
                            <span>Detalles de Auditoría</span>
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(item)}
                              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Desvincular Lote</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalItems > 10 && onPageChange && onPageSizeChange && (
        <DataTablePagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
          itemLabel="partidas"
        />
      )}
    </div>
  );
}
