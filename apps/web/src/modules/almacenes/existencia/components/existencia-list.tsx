"use client";

import * as React from "react";
import {
  Boxes,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Inbox,
  Clock,
  RefreshCw,
  Warehouse,
  Tag,
  Package,
  Layers,
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
import { cn } from "@/lib/utils";
import type { ExistenciaResponse } from "../types/existencia.types";
import type { AlmacenResponse } from "../../almacen/types/almacen.types";

interface ExistenciaListProps {
  existencias: ExistenciaResponse[];
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
  onAddExistencia?: () => void;
  onEdit?: (existencia: ExistenciaResponse) => void;
  onDelete?: (existencia: ExistenciaResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (existencia: ExistenciaResponse) => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  } catch {
    return dateStr;
  }
}

export function ExistenciaList({
  existencias,
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
  onAddExistencia,
  onEdit,
  onDelete,
  onRefresh,
  onViewAudit,
}: ExistenciaListProps) {
  return (
    <div className="flex flex-col gap-3 bg-card border border-border/60 rounded-xl p-3.5 shadow-2xs">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Boxes className="size-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Stock de Productos por Almacén
          </h2>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
            {totalItems}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="size-7 cursor-pointer border-border/60"
              title="Recargar datos"
              aria-label="Recargar datos"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            </Button>
          )}

          {onAddExistencia && (
            <Button
              onClick={onAddExistencia}
              size="sm"
              className="h-7 px-2.5 text-xs font-medium gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span className="text-[11px]">Nueva Existencia</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Almacen Filter */}
        <select
          value={selectedAlmacenId ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onAlmacenChange?.(val ? Number(val) : null);
          }}
          className="h-8 px-2.5 text-xs rounded-md border border-border/60 bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-56 cursor-pointer"
        >
          <option value="">Todos los almacenes</option>
          {almacenes.map((alm) => (
            <option key={alm.id} value={alm.id}>
              {alm.nombre} ({alm.codigo})
            </option>
          ))}
        </select>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por código de producto, nombre o almacén..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-8 text-xs h-8 bg-muted/30 border-border/60 focus:bg-background w-full"
          />
        </div>
      </div>

      {/* List Container */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-280px)] min-h-0 pr-0.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border border-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : existencias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg bg-muted/20 text-center gap-2 my-auto">
            <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Inbox className="size-4 stroke-1" />
            </div>
            <p className="text-xs font-medium text-foreground">
              Sin existencias encontradas
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              {searchTerm || selectedAlmacenId !== null
                ? "No se encontraron existencias que coincidan con los filtros aplicados."
                : "No hay registros de existencias. Haz clic en 'Nueva Existencia' para registrar stock."}
            </p>
            {onAddExistencia && !searchTerm && selectedAlmacenId === null && (
              <Button
                onClick={onAddExistencia}
                size="sm"
                variant="outline"
                className="mt-1 h-7 text-xs gap-1 cursor-pointer"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Nueva Existencia</span>
              </Button>
            )}
          </div>
        ) : (
          existencias.map((item) => {
            const rawCreated =
              item.fechaCreacion ||
              (item as any).createdAt ||
              (item as any).created_at ||
              (item as any).creadoEn;
            const formattedCreated = formatDate(rawCreated);

            const isOutOfStock = item.cantidadDisponible <= 0;
            const hasReservations = item.cantidadReservada > 0;

            return (
              <div
                key={item.id}
                className="group border border-border/50 hover:border-border bg-background/70 hover:bg-muted/30 rounded-lg px-3.5 py-2.5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
              >
                {/* Left: Product & Warehouse info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold",
                      isOutOfStock
                        ? "bg-destructive/10 border-destructive/20 text-destructive"
                        : "bg-primary/10 border-primary/20 text-primary"
                    )}
                  >
                    <Package className="size-4.5" />
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

                      {item.loteNumero && (
                        <span className="inline-flex items-center gap-1 bg-muted/40 px-1.5 py-0.5 rounded border border-border/30">
                          <Tag className="size-3 text-muted-foreground" />
                          <span>Lote: {item.loteNumero}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center / Right: Stock Quantities */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/30">
                  <div className="flex items-center gap-2">
                    {/* Total Físico */}
                    <div className="flex flex-col items-end">
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
                  </div>

                  {/* Audit & Actions */}
                  <div className="flex items-center gap-1.5">
                    {onViewAudit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewAudit(item)}
                        className="h-6 px-2 text-[10px] text-muted-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted border border-border/40 gap-1 cursor-pointer"
                        title="Ver Auditoría Completa"
                      >
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="hidden lg:inline">
                          {formattedCreated || "Auditoría"}
                        </span>
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex size-6 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground/70 transition-colors cursor-pointer"
                        aria-label="Acciones de existencia"
                      >
                        <MoreVertical className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {onViewAudit && (
                          <DropdownMenuItem
                            onClick={() => onViewAudit(item)}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <Clock className="size-3.5" /> Ver Auditoría
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => onEdit?.(item)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <Edit className="size-3.5" /> Modificar Stock
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(item)}
                          className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-3.5" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalItems > 10 && (
        <DataTablePagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange || (() => {})}
          onPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
          itemLabel="existencias"
        />
      )}
    </div>
  );
}
