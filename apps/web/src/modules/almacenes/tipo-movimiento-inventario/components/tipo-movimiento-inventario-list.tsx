"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Inbox,
  Clock,
  RefreshCw,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/shared";
import { cn } from "@/lib/utils";
import {
  NaturalezaMovimiento,
  type TipoMovimientoInventarioResponse,
} from "../types/tipo-movimiento-inventario.types";

interface TipoMovimientoInventarioListProps {
  tiposMovimiento: TipoMovimientoInventarioResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedNaturaleza?: NaturalezaMovimiento | null;
  onSearchChange?: (value: string) => void;
  onNaturalezaChange?: (naturaleza: NaturalezaMovimiento | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddTipoMovimiento?: () => void;
  onEdit?: (tipo: TipoMovimientoInventarioResponse) => void;
  onDelete?: (tipo: TipoMovimientoInventarioResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (tipo: TipoMovimientoInventarioResponse) => void;
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

export function TipoMovimientoInventarioList({
  tiposMovimiento,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  selectedNaturaleza = null,
  onSearchChange,
  onNaturalezaChange,
  onPageChange,
  onPageSizeChange,
  onAddTipoMovimiento,
  onEdit,
  onDelete,
  onRefresh,
  onViewAudit,
}: TipoMovimientoInventarioListProps) {
  const currentTab =
    selectedNaturaleza === null
      ? "all"
      : selectedNaturaleza === NaturalezaMovimiento.Entrada
      ? "entradas"
      : "salidas";

  const handleTabChange = (val: string) => {
    if (val === "all") onNaturalezaChange?.(null);
    else if (val === "entradas") onNaturalezaChange?.(NaturalezaMovimiento.Entrada);
    else if (val === "salidas") onNaturalezaChange?.(NaturalezaMovimiento.Salida);
  };

  const handleExportCsv = () => {
    if (!tiposMovimiento || tiposMovimiento.length === 0) return;
    const headers = ["ID", "Código", "Nombre", "Descripción", "Naturaleza", "Fecha Creación"];
    const rows = tiposMovimiento.map((t) => [
      t.id,
      `"${t.codigo.replace(/"/g, '""')}"`,
      `"${t.nombre.replace(/"/g, '""')}"`,
      `"${(t.descripcion || "").replace(/"/g, '""')}"`,
      t.naturaleza === NaturalezaMovimiento.Entrada ? "Entrada" : "Salida",
      t.fechaCreacion ? `"${t.fechaCreacion}"` : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `tipos_movimiento_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-3 bg-card border border-border/60 rounded-xl p-3.5 shadow-2xs">
      {/* List Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="size-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Tipos de Movimiento Registrados
          </h2>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
            {totalItems}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {tiposMovimiento.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="h-7 px-2 text-xs font-normal gap-1 cursor-pointer border-border/60 text-muted-foreground hover:text-foreground"
              title="Exportar a CSV"
            >
              <Download className="size-3.5" />
              <span className="text-[11px] hidden sm:inline">Exportar CSV</span>
            </Button>
          )}

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

          {onAddTipoMovimiento && (
            <Button
              onClick={onAddTipoMovimiento}
              size="sm"
              className="h-7 px-2.5 text-xs font-medium gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span className="text-[11px]">Nuevo Tipo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="w-full md:w-auto shrink-0"
        >
          <TabsList className="h-8 p-0.5 bg-muted/60 grid grid-cols-3 w-full md:w-80">
            <TabsTrigger
              value="all"
              className="text-[11px] h-7 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="entradas"
              className="text-[11px] h-7 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer gap-1.5 text-emerald-600 dark:text-emerald-400"
            >
              <ArrowDownLeft className="size-3" />
              Entradas
            </TabsTrigger>
            <TabsTrigger
              value="salidas"
              className="text-[11px] h-7 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer gap-1.5 text-amber-600 dark:text-amber-400"
            >
              <ArrowUpRight className="size-3" />
              Salidas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nombre o descripción..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-8 text-xs h-8 bg-muted/30 border-border/60 focus:bg-background w-full"
          />
        </div>
      </div>

      {/* List Container */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-270px)] min-h-0 pr-0.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border border-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : tiposMovimiento.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg bg-muted/20 text-center gap-2 my-auto">
            <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Inbox className="size-4 stroke-1" />
            </div>
            <p className="text-xs font-medium text-foreground">
              Sin tipos de movimiento encontrados
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              {searchTerm || selectedNaturaleza !== null
                ? "No se encontraron resultados que coincidan con los filtros aplicados."
                : "No hay tipos de movimiento configurados. Haz clic en 'Nuevo Tipo' para comenzar."}
            </p>
            {onAddTipoMovimiento && !searchTerm && selectedNaturaleza === null && (
              <Button
                onClick={onAddTipoMovimiento}
                size="sm"
                variant="outline"
                className="mt-1 h-7 text-xs gap-1 cursor-pointer"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Nuevo Tipo</span>
              </Button>
            )}
          </div>
        ) : (
          tiposMovimiento.map((tipo) => {
            const isEntrada = tipo.naturaleza === NaturalezaMovimiento.Entrada;
            const rawCreated =
              tipo.fechaCreacion ||
              (tipo as any).createdAt ||
              (tipo as any).created_at ||
              (tipo as any).creadoEn;
            const formattedCreated = formatDate(rawCreated);

            return (
              <div
                key={tipo.id}
                className="group border border-border/50 hover:border-border bg-background/70 hover:bg-muted/30 rounded-lg px-3.5 py-2.5 transition-all flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
              >
                {/* Visual Nature Badge & Code & Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold",
                      isEntrada
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                    )}
                    title={isEntrada ? "Entrada de Inventario" : "Salida de Inventario"}
                  >
                    {isEntrada ? (
                      <ArrowDownLeft className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border/40 shrink-0">
                        {tipo.codigo}
                      </span>
                      <span className="font-medium text-xs text-foreground truncate">
                        {tipo.nombre}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 font-normal shrink-0",
                          isEntrada
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                        )}
                      >
                        {isEntrada ? "Entrada (+)" : "Salida (-)"}
                      </Badge>
                    </div>

                    {tipo.descripcion ? (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {tipo.descripcion}
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/60 italic">
                        Sin descripción adicional
                      </p>
                    )}
                  </div>
                </div>

                {/* Audit & Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {onViewAudit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewAudit(tipo)}
                      className="h-6 px-2 text-[10px] text-muted-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted border border-border/40 gap-1 cursor-pointer"
                      title="Ver Auditoría Completa"
                    >
                      <Clock className="size-3 text-muted-foreground" />
                      <span className="hidden sm:inline">
                        {formattedCreated || "Auditoría"}
                      </span>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex size-6 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground/70 transition-colors cursor-pointer"
                      aria-label={`Acciones de ${tipo.nombre}`}
                    >
                      <MoreVertical className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {onViewAudit && (
                        <DropdownMenuItem
                          onClick={() => onViewAudit(tipo)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <Clock className="size-3.5" /> Ver Auditoría
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onEdit?.(tipo)}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <Edit className="size-3.5" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(tipo)}
                        className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3.5" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
          itemLabel="tipos de movimiento"
        />
      )}
    </div>
  );
}
