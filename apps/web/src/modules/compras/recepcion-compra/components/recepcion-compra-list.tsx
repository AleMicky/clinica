"use client";

import * as React from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  CheckCircle2,
  Ban,
  Eye,
  Trash2,
  Inbox,
  Clock,
  Download,
  Building2,
  Warehouse,
  ShieldCheck,
  X,
  PackageCheck,
  FileText,
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
  EstadoRecepcionCompra,
  type RecepcionCompraResponse,
} from "../types/recepcion-compra.types";
import { AlmacenAutocomplete } from "@/modules/almacenes/almacen";
import { ProveedorAutocomplete } from "@/modules/compras/proveedor";

interface RecepcionCompraListProps {
  recepciones: RecepcionCompraResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedProveedorId?: number | null;
  selectedAlmacenId?: number | null;
  selectedEstado?: EstadoRecepcionCompra | null;
  onSearchChange?: (value: string) => void;
  onProveedorChange?: (proveedorId: number | null) => void;
  onAlmacenChange?: (almacenId: number | null) => void;
  onEstadoChange?: (estado: EstadoRecepcionCompra | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddRecepcion?: () => void;
  onViewDetail?: (recepcion: RecepcionCompraResponse) => void;
  onEdit?: (recepcion: RecepcionCompraResponse) => void;
  onConfirm?: (recepcion: RecepcionCompraResponse) => void;
  onAnular?: (recepcion: RecepcionCompraResponse) => void;
  onDelete?: (recepcion: RecepcionCompraResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (recepcion: RecepcionCompraResponse) => void;
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

export function getEstadoBadge(estado: EstadoRecepcionCompra) {
  switch (estado) {
    case EstadoRecepcionCompra.Borrador:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-slate-700 dark:text-slate-300 border-slate-500/30 bg-slate-500/10 gap-1"
        >
          <Clock className="size-3" />
          Borrador
        </Badge>
      );
    case EstadoRecepcionCompra.Confirmada:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
        >
          <CheckCircle2 className="size-3" />
          Confirmada (En Stock)
        </Badge>
      );
    case EstadoRecepcionCompra.Anulada:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-rose-700 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 gap-1"
        >
          <Ban className="size-3" />
          Anulada
        </Badge>
      );
    default:
      return null;
  }
}

export function RecepcionCompraList({
  recepciones,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  selectedProveedorId = null,
  selectedAlmacenId = null,
  selectedEstado = null,
  onSearchChange,
  onProveedorChange,
  onAlmacenChange,
  onEstadoChange,
  onPageChange,
  onPageSizeChange,
  onAddRecepcion,
  onViewDetail,
  onEdit,
  onConfirm,
  onAnular,
  onDelete,
  onRefresh,
  onViewAudit,
}: RecepcionCompraListProps) {
  // Export CSV
  const handleExportCSV = () => {
    if (recepciones.length === 0) return;

    const headers = [
      "Número",
      "Orden Compra",
      "Proveedor",
      "Almacén",
      "Fecha Recepción",
      "Factura",
      "Remisión",
      "Estado",
    ];

    const rows = recepciones.map((r) => [
      `"${r.numero}"`,
      `"${r.ordenCompraNumero || ""}"`,
      `"${r.proveedorRazonSocial || ""}"`,
      `"${r.almacenNombre || ""}"`,
      `"${formatDate(r.fechaRecepcion)}"`,
      `"${r.numeroFactura || ""}"`,
      `"${r.numeroRemision || ""}"`,
      r.estado,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `recepciones_compra_${new Date().toISOString().slice(0, 10)}.csv`
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
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Buscar por número, factura o remisión..."
              className="h-7.5 pl-8 pr-7 text-xs bg-background/50 border-border/50 focus:border-emerald-500/50"
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
          <div className="w-[170px] sm:w-[200px]">
            <ProveedorAutocomplete
              value={selectedProveedorId}
              onValueChange={(val) => onProveedorChange?.(val)}
              placeholder="Filtrar proveedor..."
              className="h-7.5 text-xs bg-background/50"
            />
          </div>

          {/* Almacen Filter */}
          <div className="w-[170px] sm:w-[200px]">
            <AlmacenAutocomplete
              value={selectedAlmacenId}
              onValueChange={(val) => onAlmacenChange?.(val)}
              placeholder="Filtrar almacén..."
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
            disabled={recepciones.length === 0}
            className="h-7.5 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            title="Exportar a CSV"
          >
            <Download className="size-3" />
            <span className="hidden md:inline">Exportar</span>
          </Button>

          {onAddRecepcion && (
            <Button
              size="sm"
              onClick={onAddRecepcion}
              className="h-7.5 px-2.5 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-2xs cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Nueva Recepción</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Filter by Estado */}
      <Tabs
        value={selectedEstado ? String(selectedEstado) : "all"}
        onValueChange={(val) =>
          onEstadoChange?.(
            val === "all" ? null : (Number(val) as EstadoRecepcionCompra)
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
            value={String(EstadoRecepcionCompra.Borrador)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Borrador
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoRecepcionCompra.Confirmada)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Confirmadas
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoRecepcionCompra.Anulada)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Anuladas
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
                  Recepción
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Orden Compra
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Proveedor
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Almacén
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Fecha Ingreso
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Documentos
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
                      <Skeleton className="h-3.5 w-20" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-32" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-24" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-20" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-24" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-4.5 w-20 rounded-md" />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Skeleton className="h-6 w-6 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : recepciones.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                        <Inbox className="size-5" />
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        No se encontraron recepciones de compra
                      </span>
                      <p className="text-[11px] text-muted-foreground max-w-sm">
                        {searchTerm || selectedProveedorId || selectedAlmacenId || selectedEstado
                          ? "Prueba cambiando o limpiando los filtros aplicados"
                          : "Comienza registrando la recepción de mercadería de una orden"}
                      </p>
                      {onAddRecepcion && (
                        <Button
                          size="sm"
                          onClick={onAddRecepcion}
                          className="mt-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 cursor-pointer"
                        >
                          <Plus className="size-3" />
                          Crear Recepción
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                recepciones.map((r) => {
                  const isBorrador =
                    r.estado === EstadoRecepcionCompra.Borrador;
                  const isConfirmada =
                    r.estado === EstadoRecepcionCompra.Confirmada;

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => onViewDetail?.(r)}
                    >
                      {/* Recepcion Number */}
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <PackageCheck className="size-3" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-foreground hover:text-emerald-600 transition-colors">
                              {r.numero}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Orden Compra */}
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">
                        {r.ordenCompraNumero || `#${r.ordenCompraId}`}
                      </td>

                      {/* Proveedor */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="size-3 text-muted-foreground" />
                          <span className="text-foreground font-medium truncate max-w-[140px]">
                            {r.proveedorRazonSocial || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Almacén */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Warehouse className="size-3 text-muted-foreground" />
                          <span className="text-foreground truncate max-w-[120px]">
                            {r.almacenNombre || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Fecha Recepción */}
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(r.fechaRecepcion)}
                      </td>

                      {/* Factura / Remisión */}
                      <td className="px-3 py-2.5 text-muted-foreground">
                        <div className="flex flex-col text-[10px]">
                          {r.numeroFactura && (
                            <span>Fact: {r.numeroFactura}</span>
                          )}
                          {r.numeroRemision && (
                            <span>Rem: {r.numeroRemision}</span>
                          )}
                          {!r.numeroFactura && !r.numeroRemision && "-"}
                        </div>
                      </td>

                      {/* Estado Badge */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {getEstadoBadge(r.estado)}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-3 py-2.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                            aria-label={`Acciones de ${r.numero}`}
                          >
                            <MoreVertical className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs">
                            <DropdownMenuItem
                              onClick={() => onViewDetail?.(r)}
                              className="gap-2 cursor-pointer"
                            >
                              <Eye className="size-3.5 text-muted-foreground" />
                              Ver Detalle
                            </DropdownMenuItem>

                            {isBorrador && onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit?.(r)}
                                className="gap-2 cursor-pointer"
                              >
                                <Edit className="size-3.5 text-blue-500" />
                                Editar Recepción
                              </DropdownMenuItem>
                            )}

                            {isBorrador && onConfirm && (
                              <DropdownMenuItem
                                onClick={() => onConfirm?.(r)}
                                className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium"
                              >
                                <CheckCircle2 className="size-3.5" />
                                Confirmar Ingreso
                              </DropdownMenuItem>
                            )}

                            {isConfirmada && onAnular && (
                              <DropdownMenuItem
                                onClick={() => onAnular?.(r)}
                                className="gap-2 cursor-pointer text-rose-600 dark:text-rose-400"
                              >
                                <Ban className="size-3.5" />
                                Anular Recepción
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {onViewAudit && (
                              <DropdownMenuItem
                                onClick={() => onViewAudit(r)}
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
                                  onClick={() => onDelete(r)}
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
