"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  CheckCircle2,
  XCircle,
  Ban,
  Eye,
  Trash2,
  Inbox,
  Clock,
  Download,
  Building2,
  ShieldCheck,
  X,
  FileSpreadsheet,
  CheckCheck,
  Calendar,
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
import {
  EstadoCotizacionCompra,
  type CotizacionCompraResponse,
} from "../types/cotizacion-compra.types";
import { ProveedorAutocomplete } from "@/modules/compras/proveedor";

interface CotizacionCompraListProps {
  cotizaciones: CotizacionCompraResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedProveedorId?: number | null;
  selectedEstado?: EstadoCotizacionCompra | null;
  onSearchChange?: (value: string) => void;
  onProveedorChange?: (proveedorId: number | null) => void;
  onEstadoChange?: (estado: EstadoCotizacionCompra | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddCotizacion?: () => void;
  onViewDetail?: (cotizacion: CotizacionCompraResponse) => void;
  onEdit?: (cotizacion: CotizacionCompraResponse) => void;
  onRecibir?: (cotizacion: CotizacionCompraResponse) => void;
  onSeleccionar?: (cotizacion: CotizacionCompraResponse) => void;
  onRechazar?: (cotizacion: CotizacionCompraResponse) => void;
  onCancel?: (cotizacion: CotizacionCompraResponse) => void;
  onDelete?: (cotizacion: CotizacionCompraResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (cotizacion: CotizacionCompraResponse) => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  } catch {
    return dateStr;
  }
}

function formatDateOnly(dateStr?: string | null) {
  if (!dateStr) return "-";
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

export function getEstadoBadge(estado: EstadoCotizacionCompra) {
  switch (estado) {
    case EstadoCotizacionCompra.Borrador:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-slate-700 dark:text-slate-300 border-slate-500/30 bg-slate-500/10 gap-1"
        >
          <Clock className="size-3" />
          Borrador
        </Badge>
      );
    case EstadoCotizacionCompra.Recibida:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-blue-700 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 gap-1"
        >
          <CheckCircle2 className="size-3" />
          Recibida
        </Badge>
      );
    case EstadoCotizacionCompra.Seleccionada:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
        >
          <CheckCheck className="size-3" />
          Seleccionada
        </Badge>
      );
    case EstadoCotizacionCompra.Rechazada:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-rose-700 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 gap-1"
        >
          <XCircle className="size-3" />
          Rechazada
        </Badge>
      );
    case EstadoCotizacionCompra.Vencida:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1"
        >
          <Clock className="size-3" />
          Vencida
        </Badge>
      );
    case EstadoCotizacionCompra.Cancelada:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-zinc-700 dark:text-zinc-400 border-zinc-500/30 bg-zinc-500/10 gap-1"
        >
          <Ban className="size-3" />
          Cancelada
        </Badge>
      );
    default:
      return null;
  }
}

export function CotizacionCompraList({
  cotizaciones,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  selectedProveedorId = null,
  selectedEstado = null,
  onSearchChange,
  onProveedorChange,
  onEstadoChange,
  onPageChange,
  onPageSizeChange,
  onAddCotizacion,
  onViewDetail,
  onEdit,
  onRecibir,
  onSeleccionar,
  onRechazar,
  onCancel,
  onDelete,
  onRefresh,
  onViewAudit,
}: CotizacionCompraListProps) {
  // Export CSV
  const handleExportCSV = () => {
    if (cotizaciones.length === 0) return;

    const headers = [
      "Número",
      "Proveedor",
      "Solicitud",
      "Fecha",
      "Vencimiento",
      "Estado",
      "Subtotal",
      "Total",
    ];

    const rows = cotizaciones.map((c) => [
      `"${c.numero}"`,
      `"${c.proveedorRazonSocial || ""}"`,
      `"${c.solicitudCompraNumero || "-"}"`,
      `"${formatDate(c.fecha)}"`,
      `"${c.fechaVencimiento ? formatDateOnly(c.fechaVencimiento) : ""}"`,
      c.estado,
      c.subtotal,
      c.total,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `cotizaciones_compra_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-card border border-border/60 rounded-lg p-2.5 shadow-2xs">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Buscar por número u observación..."
              className="h-7.5 pl-8 pr-7 text-xs bg-background/50 border-border/50 focus:border-teal-500/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Proveedor Filter */}
          <div className="w-[180px] sm:w-[220px]">
            <ProveedorAutocomplete
              value={selectedProveedorId}
              onValueChange={(val) => onProveedorChange?.(val)}
              placeholder="Filtrar por proveedor..."
              className="h-7.5 text-xs bg-background/50"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={cotizaciones.length === 0}
            className="h-7.5 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            title="Exportar a CSV"
          >
            <Download className="size-3" />
            <span className="hidden md:inline">Exportar</span>
          </Button>

          {onAddCotizacion && (
            <Button
              size="sm"
              onClick={onAddCotizacion}
              className="h-7.5 px-2.5 gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-2xs cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Nueva Cotización</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Filter by Estado */}
      <Tabs
        value={selectedEstado ? String(selectedEstado) : "all"}
        onValueChange={(val) =>
          onEstadoChange?.(
            val === "all" ? null : (Number(val) as EstadoCotizacionCompra)
          )
        }
        className="w-full"
      >
        <TabsList className="h-7.5 p-0.5 bg-muted/60 border border-border/40 grid grid-cols-3 sm:flex sm:w-auto w-full">
          <TabsTrigger
            value="all"
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Todos
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoCotizacionCompra.Borrador)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Borrador
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoCotizacionCompra.Recibida)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Recibidas
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoCotizacionCompra.Seleccionada)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Seleccionadas
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoCotizacionCompra.Rechazada)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Rechazadas
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table Container */}
      <div className="bg-card border border-border/60 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-muted-foreground uppercase bg-muted/40 border-b border-border/60">
              <tr>
                <th scope="col" className="px-3.5 py-2 font-medium">
                  Cotización
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Proveedor
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Solicitud Origen
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Fecha Emisión
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-right">
                  Monto Total
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="px-3.5 py-2.5">
                      <Skeleton className="h-3.5 w-24" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-32" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-20" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-20" />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Skeleton className="h-3.5 w-16 ml-auto" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-4.5 w-20 rounded-md" />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Skeleton className="h-6 w-6 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : cotizaciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                        <Inbox className="size-5" />
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        No se encontraron cotizaciones de compra
                      </span>
                      <p className="text-[11px] text-muted-foreground max-w-sm">
                        {searchTerm || selectedProveedorId || selectedEstado
                          ? "Prueba cambiando o limpiando los filtros aplicados"
                          : "Comienza registrando la primera cotización de proveedor"}
                      </p>
                      {onAddCotizacion && (
                        <Button
                          size="sm"
                          onClick={onAddCotizacion}
                          className="mt-1 h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1 cursor-pointer"
                        >
                          <Plus className="size-3" />
                          Crear Cotización
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                cotizaciones.map((c) => {
                  const isBorrador =
                    c.estado === EstadoCotizacionCompra.Borrador;
                  const isRecibida =
                    c.estado === EstadoCotizacionCompra.Recibida;
                  const isCancelable =
                    isBorrador || isRecibida;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => onViewDetail?.(c)}
                    >
                      {/* Cotización Number */}
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="size-3" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-foreground hover:text-teal-600 transition-colors">
                              {c.numero}
                            </span>
                            {c.observacion && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                                {c.observacion}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Proveedor */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="size-3 text-muted-foreground" />
                          <span className="text-foreground font-medium truncate max-w-[150px]">
                            {c.proveedorRazonSocial || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Solicitud Compra */}
                      <td className="px-3 py-2.5 text-muted-foreground font-mono">
                        {c.solicitudCompraNumero || "-"}
                      </td>

                      {/* Fecha Emisión */}
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(c.fecha)}
                      </td>

                      {/* Monto Total */}
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-foreground">
                        {Number(c.total || 0).toLocaleString("es-ES", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Estado Badge */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {getEstadoBadge(c.estado)}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-3 py-2.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                            aria-label={`Acciones de ${c.numero}`}
                          >
                            <MoreVertical className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs">
                            <DropdownMenuItem
                              onClick={() => onViewDetail?.(c)}
                              className="gap-2 cursor-pointer"
                            >
                              <Eye className="size-3.5 text-muted-foreground" />
                              Ver Detalle
                            </DropdownMenuItem>

                            {isBorrador && onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit?.(c)}
                                className="gap-2 cursor-pointer"
                              >
                                <Edit className="size-3.5 text-blue-500" />
                                Editar Cotización
                              </DropdownMenuItem>
                            )}

                            {isBorrador && onRecibir && (
                              <DropdownMenuItem
                                onClick={() => onRecibir?.(c)}
                                className="gap-2 cursor-pointer text-blue-600 dark:text-blue-400"
                              >
                                <CheckCircle2 className="size-3.5" />
                                Marcar Recibida
                              </DropdownMenuItem>
                            )}

                            {isRecibida && onSeleccionar && (
                              <DropdownMenuItem
                                onClick={() => onSeleccionar?.(c)}
                                className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium"
                              >
                                <CheckCheck className="size-3.5" />
                                Seleccionar Ganadora
                              </DropdownMenuItem>
                            )}

                            {isRecibida && onRechazar && (
                              <DropdownMenuItem
                                onClick={() => onRechazar?.(c)}
                                className="gap-2 cursor-pointer text-rose-600 dark:text-rose-400"
                              >
                                <XCircle className="size-3.5" />
                                Rechazar
                              </DropdownMenuItem>
                            )}

                            {isCancelable && onCancel && (
                              <DropdownMenuItem
                                onClick={() => onCancel?.(c)}
                                className="gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400"
                              >
                                <Ban className="size-3.5" />
                                Cancelar
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {onViewAudit && (
                              <DropdownMenuItem
                                onClick={() => onViewAudit(c)}
                                className="gap-2 cursor-pointer"
                              >
                                <ShieldCheck className="size-3.5 text-muted-foreground" />
                                Ver Auditoría
                              </DropdownMenuItem>
                            )}

                            {isBorrador && onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDelete(c)}
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="size-3.5" />
                                  Eliminar Borrador
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && onPageChange && onPageSizeChange && (
          <div className="p-2 border-t border-border/60 bg-card">
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
