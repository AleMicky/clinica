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
  Send,
  Trash2,
  Inbox,
  Clock,
  Download,
  Building2,
  Warehouse,
  ShieldCheck,
  X,
  Undo2,
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
  EstadoDevolucionProveedor,
  type DevolucionProveedorResponse,
} from "../types/devolucion-proveedor.types";
import { AlmacenAutocomplete } from "@/modules/almacenes/almacen";
import { ProveedorAutocomplete } from "@/modules/compras/proveedor";

interface DevolucionProveedorListProps {
  devoluciones: DevolucionProveedorResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedProveedorId?: number | null;
  selectedAlmacenId?: number | null;
  selectedEstado?: EstadoDevolucionProveedor | null;
  onSearchChange?: (value: string) => void;
  onProveedorChange?: (proveedorId: number | null) => void;
  onAlmacenChange?: (almacenId: number | null) => void;
  onEstadoChange?: (estado: EstadoDevolucionProveedor | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddDevolucion?: () => void;
  onViewDetail?: (devolucion: DevolucionProveedorResponse) => void;
  onEdit?: (devolucion: DevolucionProveedorResponse) => void;
  onSendApproval?: (devolucion: DevolucionProveedorResponse) => void;
  onApprove?: (devolucion: DevolucionProveedorResponse) => void;
  onReject?: (devolucion: DevolucionProveedorResponse) => void;
  onConfirm?: (devolucion: DevolucionProveedorResponse) => void;
  onAnular?: (devolucion: DevolucionProveedorResponse) => void;
  onDelete?: (devolucion: DevolucionProveedorResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (devolucion: DevolucionProveedorResponse) => void;
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

export function getEstadoBadge(estado: EstadoDevolucionProveedor) {
  switch (estado) {
    case EstadoDevolucionProveedor.Borrador:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-slate-700 dark:text-slate-300 border-slate-500/30 bg-slate-500/10 gap-1"
        >
          <Clock className="size-3" />
          Borrador
        </Badge>
      );
    case EstadoDevolucionProveedor.PendienteAprobacion:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1"
        >
          <Clock className="size-3" />
          Pend. Aprobación
        </Badge>
      );
    case EstadoDevolucionProveedor.Aprobada:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-blue-700 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 gap-1"
        >
          <CheckCircle2 className="size-3" />
          Aprobada
        </Badge>
      );
    case EstadoDevolucionProveedor.Confirmada:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
        >
          <CheckCircle2 className="size-3" />
          Confirmada (Stock Salido)
        </Badge>
      );
    case EstadoDevolucionProveedor.Rechazada:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-rose-700 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 gap-1"
        >
          <XCircle className="size-3" />
          Rechazada
        </Badge>
      );
    case EstadoDevolucionProveedor.Anulada:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-zinc-700 dark:text-zinc-400 border-zinc-500/30 bg-zinc-500/10 gap-1"
        >
          <Ban className="size-3" />
          Anulada
        </Badge>
      );
    default:
      return null;
  }
}

export function DevolucionProveedorList({
  devoluciones,
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
  onAddDevolucion,
  onViewDetail,
  onEdit,
  onSendApproval,
  onApprove,
  onReject,
  onConfirm,
  onAnular,
  onDelete,
  onRefresh,
  onViewAudit,
}: DevolucionProveedorListProps) {
  // Export CSV
  const handleExportCSV = () => {
    if (devoluciones.length === 0) return;

    const headers = [
      "Número",
      "Proveedor",
      "Almacén",
      "Fecha",
      "Motivo",
      "Estado",
    ];

    const rows = devoluciones.map((d) => [
      `"${d.numero}"`,
      `"${d.proveedorRazonSocial || ""}"`,
      `"${d.almacenNombre || ""}"`,
      `"${formatDate(d.fecha)}"`,
      `"${d.motivo.replace(/"/g, '""')}"`,
      d.estado,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `devoluciones_proveedor_${new Date().toISOString().slice(0, 10)}.csv`
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
              placeholder="Buscar por número o motivo..."
              className="h-7.5 pl-8 pr-7 text-xs bg-background/50 border-border/50 focus:border-orange-500/50"
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
            disabled={devoluciones.length === 0}
            className="h-7.5 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            title="Exportar a CSV"
          >
            <Download className="size-3" />
            <span className="hidden md:inline">Exportar</span>
          </Button>

          {onAddDevolucion && (
            <Button
              size="sm"
              onClick={onAddDevolucion}
              className="h-7.5 px-2.5 gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-2xs cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Nueva Devolución</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Filter by Estado */}
      <Tabs
        value={selectedEstado ? String(selectedEstado) : "all"}
        onValueChange={(val) =>
          onEstadoChange?.(
            val === "all" ? null : (Number(val) as EstadoDevolucionProveedor)
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
            value={String(EstadoDevolucionProveedor.Borrador)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Borrador
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoDevolucionProveedor.PendienteAprobacion)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Pend. Aprobación
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoDevolucionProveedor.Aprobada)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Aprobadas
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoDevolucionProveedor.Confirmada)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Confirmadas
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoDevolucionProveedor.Rechazada)}
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
                  Devolución
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Proveedor
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Almacén Origen
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Fecha Emisión
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Motivo / Causa
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
                      <Skeleton className="h-3.5 w-24" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-20" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-36" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-4.5 w-20 rounded-md" />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Skeleton className="h-6 w-6 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : devoluciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                        <Inbox className="size-5" />
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        No se encontraron devoluciones a proveedor
                      </span>
                      <p className="text-[11px] text-muted-foreground max-w-sm">
                        {searchTerm || selectedProveedorId || selectedAlmacenId || selectedEstado
                          ? "Prueba cambiando o limpiando los filtros aplicados"
                          : "Comienza registrando la devolución de productos defectuosos o vencidos"}
                      </p>
                      {onAddDevolucion && (
                        <Button
                          size="sm"
                          onClick={onAddDevolucion}
                          className="mt-1 h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1 cursor-pointer"
                        >
                          <Plus className="size-3" />
                          Crear Devolución
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                devoluciones.map((d) => {
                  const isBorrador =
                    d.estado === EstadoDevolucionProveedor.Borrador;
                  const isPendiente =
                    d.estado === EstadoDevolucionProveedor.PendienteAprobacion;
                  const isAprobada =
                    d.estado === EstadoDevolucionProveedor.Aprobada;
                  const isConfirmada =
                    d.estado === EstadoDevolucionProveedor.Confirmada;

                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => onViewDetail?.(d)}
                    >
                      {/* Devolucion Number */}
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                            <Undo2 className="size-3" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-foreground hover:text-orange-600 transition-colors">
                              {d.numero}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Proveedor */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="size-3 text-muted-foreground" />
                          <span className="text-foreground font-medium truncate max-w-[140px]">
                            {d.proveedorRazonSocial || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Almacén */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Warehouse className="size-3 text-muted-foreground" />
                          <span className="text-foreground truncate max-w-[120px]">
                            {d.almacenNombre || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Fecha Devolución */}
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(d.fecha)}
                      </td>

                      {/* Motivo */}
                      <td className="px-3 py-2.5 text-foreground max-w-[180px] truncate">
                        {d.motivo}
                      </td>

                      {/* Estado Badge */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {getEstadoBadge(d.estado)}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-3 py-2.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                            aria-label={`Acciones de ${d.numero}`}
                          >
                            <MoreVertical className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs">
                            <DropdownMenuItem
                              onClick={() => onViewDetail?.(d)}
                              className="gap-2 cursor-pointer"
                            >
                              <Eye className="size-3.5 text-muted-foreground" />
                              Ver Detalle
                            </DropdownMenuItem>

                            {isBorrador && onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit?.(d)}
                                className="gap-2 cursor-pointer"
                              >
                                <Edit className="size-3.5 text-blue-500" />
                                Editar Devolución
                              </DropdownMenuItem>
                            )}

                            {isBorrador && onSendApproval && (
                              <DropdownMenuItem
                                onClick={() => onSendApproval?.(d)}
                                className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400"
                              >
                                <Send className="size-3.5" />
                                Enviar a Aprobación
                              </DropdownMenuItem>
                            )}

                            {isPendiente && onApprove && (
                              <DropdownMenuItem
                                onClick={() => onApprove?.(d)}
                                className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium"
                              >
                                <CheckCircle2 className="size-3.5" />
                                Aprobar Devolución
                              </DropdownMenuItem>
                            )}

                            {isPendiente && onReject && (
                              <DropdownMenuItem
                                onClick={() => onReject?.(d)}
                                className="gap-2 cursor-pointer text-rose-600 dark:text-rose-400"
                              >
                                <XCircle className="size-3.5" />
                                Rechazar
                              </DropdownMenuItem>
                            )}

                            {isAprobada && onConfirm && (
                              <DropdownMenuItem
                                onClick={() => onConfirm?.(d)}
                                className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium"
                              >
                                <CheckCircle2 className="size-3.5" />
                                Confirmar Salida Stock
                              </DropdownMenuItem>
                            )}

                            {isConfirmada && onAnular && (
                              <DropdownMenuItem
                                onClick={() => onAnular?.(d)}
                                className="gap-2 cursor-pointer text-rose-600 dark:text-rose-400"
                              >
                                <Ban className="size-3.5" />
                                Anular Devolución
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {onViewAudit && (
                              <DropdownMenuItem
                                onClick={() => onViewAudit(d)}
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
                                  onClick={() => onDelete(d)}
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
