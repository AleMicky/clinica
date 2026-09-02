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
  Warehouse,
  ShieldCheck,
  X,
  ShoppingCart,
  Hourglass,
  PackageCheck,
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
  EstadoSolicitudCompra,
  type SolicitudCompraResponse,
} from "../types/solicitud-compra.types";
import { AlmacenAutocomplete } from "@/modules/almacenes/almacen";

interface SolicitudCompraListProps {
  solicitudes: SolicitudCompraResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedAlmacenId?: number | null;
  selectedEstado?: EstadoSolicitudCompra | null;
  onSearchChange?: (value: string) => void;
  onAlmacenChange?: (almacenId: number | null) => void;
  onEstadoChange?: (estado: EstadoSolicitudCompra | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddSolicitud?: () => void;
  onViewDetail?: (solicitud: SolicitudCompraResponse) => void;
  onEdit?: (solicitud: SolicitudCompraResponse) => void;
  onSendApproval?: (solicitud: SolicitudCompraResponse) => void;
  onApprove?: (solicitud: SolicitudCompraResponse) => void;
  onReject?: (solicitud: SolicitudCompraResponse) => void;
  onCancel?: (solicitud: SolicitudCompraResponse) => void;
  onDelete?: (solicitud: SolicitudCompraResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (solicitud: SolicitudCompraResponse) => void;
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

export function getEstadoBadge(estado: EstadoSolicitudCompra) {
  switch (estado) {
    case EstadoSolicitudCompra.Borrador:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-slate-700 dark:text-slate-300 border-slate-500/30 bg-slate-500/10 gap-1"
        >
          <Clock className="size-3" />
          Borrador
        </Badge>
      );
    case EstadoSolicitudCompra.PendienteAprobacion:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1"
        >
          <Hourglass className="size-3" />
          Pend. Aprobación
        </Badge>
      );
    case EstadoSolicitudCompra.Aprobada:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
        >
          <CheckCircle2 className="size-3" />
          Aprobada
        </Badge>
      );
    case EstadoSolicitudCompra.Rechazada:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-rose-700 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 gap-1"
        >
          <XCircle className="size-3" />
          Rechazada
        </Badge>
      );
    case EstadoSolicitudCompra.Atendida:
      return (
        <Badge
          variant="outline"
          className="text-[10px] h-5 px-1.5 font-semibold text-blue-700 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 gap-1"
        >
          <PackageCheck className="size-3" />
          Atendida
        </Badge>
      );
    case EstadoSolicitudCompra.Cancelada:
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

export function SolicitudCompraList({
  solicitudes,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  selectedAlmacenId = null,
  selectedEstado = null,
  onSearchChange,
  onAlmacenChange,
  onEstadoChange,
  onPageChange,
  onPageSizeChange,
  onAddSolicitud,
  onViewDetail,
  onEdit,
  onSendApproval,
  onApprove,
  onReject,
  onCancel,
  onDelete,
  onRefresh,
  onViewAudit,
}: SolicitudCompraListProps) {
  // Export CSV handler
  const handleExportCSV = () => {
    if (solicitudes.length === 0) return;

    const headers = [
      "Número",
      "Almacén",
      "Fecha Solicitud",
      "Fecha Requerida",
      "Estado",
      "Items",
      "Observación",
    ];

    const getEstadoName = (est: EstadoSolicitudCompra) => {
      switch (est) {
        case EstadoSolicitudCompra.Borrador:
          return "Borrador";
        case EstadoSolicitudCompra.PendienteAprobacion:
          return "Pendiente Aprobación";
        case EstadoSolicitudCompra.Aprobada:
          return "Aprobada";
        case EstadoSolicitudCompra.Rechazada:
          return "Rechazada";
        case EstadoSolicitudCompra.Atendida:
          return "Atendida";
        case EstadoSolicitudCompra.Cancelada:
          return "Cancelada";
        default:
          return "";
      }
    };

    const rows = solicitudes.map((s) => [
      `"${s.numero}"`,
      `"${s.almacenNombre || ""}"`,
      `"${formatDate(s.fechaSolicitud)}"`,
      `"${s.fechaRequerida ? formatDateOnly(s.fechaRequerida) : ""}"`,
      `"${getEstadoName(s.estado)}"`,
      s.detalles?.length || 0,
      `"${(s.observacion || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `solicitudes_compra_${new Date().toISOString().slice(0, 10)}.csv`
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
              className="h-7.5 pl-8 pr-7 text-xs bg-background/50 border-border/50 focus:border-indigo-500/50"
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

          {/* Almacen Filter */}
          <div className="w-[180px] sm:w-[210px]">
            <AlmacenAutocomplete
              value={selectedAlmacenId}
              onValueChange={(val) => onAlmacenChange?.(val)}
              placeholder="Filtrar por almacén..."
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
            disabled={solicitudes.length === 0}
            className="h-7.5 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            title="Exportar a CSV"
          >
            <Download className="size-3" />
            <span className="hidden md:inline">Exportar</span>
          </Button>

          {onAddSolicitud && (
            <Button
              size="sm"
              onClick={onAddSolicitud}
              className="h-7.5 px-2.5 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-2xs cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Nueva Solicitud</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Filter by Estado */}
      <Tabs
        value={selectedEstado ? String(selectedEstado) : "all"}
        onValueChange={(val) =>
          onEstadoChange?.(
            val === "all" ? null : (Number(val) as EstadoSolicitudCompra)
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
            value={String(EstadoSolicitudCompra.Borrador)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Borrador
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoSolicitudCompra.PendienteAprobacion)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Pend. Aprobación
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoSolicitudCompra.Aprobada)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Aprobadas
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoSolicitudCompra.Atendida)}
            className="text-[11px] h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            Atendidas
          </TabsTrigger>
          <TabsTrigger
            value={String(EstadoSolicitudCompra.Rechazada)}
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
                  Solicitud
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Almacén
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Fecha Emisión
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Fecha Requerida
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-center">
                  Items
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
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-2.5 w-36" />
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-28" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-20" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-20" />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Skeleton className="h-3.5 w-8 mx-auto" />
                    </td>
                    <td className="px-3 py-2.5">
                      <Skeleton className="h-4.5 w-20 rounded-md" />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Skeleton className="h-6 w-6 ml-auto rounded-md" />
                    </td>
                  </tr>
                ))
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                        <Inbox className="size-5" />
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        No se encontraron solicitudes de compra
                      </span>
                      <p className="text-[11px] text-muted-foreground max-w-sm">
                        {searchTerm || selectedAlmacenId || selectedEstado
                          ? "Prueba cambiando o limpiando los filtros aplicados"
                          : "Comienza creando tu primera solicitud de abastecimiento"}
                      </p>
                      {onAddSolicitud && (
                        <Button
                          size="sm"
                          onClick={onAddSolicitud}
                          className="mt-1 h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1 cursor-pointer"
                        >
                          <Plus className="size-3" />
                          Crear Solicitud
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                solicitudes.map((s) => {
                  const isBorrador =
                    s.estado === EstadoSolicitudCompra.Borrador;
                  const isPendiente =
                    s.estado === EstadoSolicitudCompra.PendienteAprobacion;
                  const isAprobada =
                    s.estado === EstadoSolicitudCompra.Aprobada;
                  const isCancelable =
                    isBorrador || isPendiente || isAprobada;

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => onViewDetail?.(s)}
                    >
                      {/* Solicitud Number & Obs */}
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <ShoppingCart className="size-3" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-foreground hover:text-indigo-600 transition-colors">
                              {s.numero}
                            </span>
                            {s.observacion && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                                {s.observacion}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Almacen */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Warehouse className="size-3 text-muted-foreground" />
                          <span className="text-foreground font-medium truncate max-w-[140px]">
                            {s.almacenNombre || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Fecha Solicitud */}
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        {formatDate(s.fechaSolicitud)}
                      </td>

                      {/* Fecha Requerida */}
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        {s.fechaRequerida ? (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <Calendar className="size-3 text-muted-foreground" />
                            {formatDateOnly(s.fechaRequerida)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* Cantidad de Items */}
                      <td className="px-3 py-2.5 text-center">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono h-4.5 px-1.5 font-semibold"
                        >
                          {s.detalles?.length || 0} prod.
                        </Badge>
                      </td>

                      {/* Estado Badge */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {getEstadoBadge(s.estado)}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-3 py-2.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                            aria-label={`Acciones de ${s.numero}`}
                          >
                            <MoreVertical className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 text-xs">
                            <DropdownMenuItem
                              onClick={() => onViewDetail?.(s)}
                              className="gap-2 cursor-pointer"
                            >
                              <Eye className="size-3.5 text-muted-foreground" />
                              Ver Detalle
                            </DropdownMenuItem>

                            {isBorrador && onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit?.(s)}
                                className="gap-2 cursor-pointer"
                              >
                                <Edit className="size-3.5 text-blue-500" />
                                Editar Solicitud
                              </DropdownMenuItem>
                            )}

                            {isBorrador && onSendApproval && (
                              <DropdownMenuItem
                                onClick={() => onSendApproval?.(s)}
                                className="gap-2 cursor-pointer text-amber-600 dark:text-amber-400"
                              >
                                <Send className="size-3.5" />
                                Enviar a Aprobación
                              </DropdownMenuItem>
                            )}

                            {isPendiente && onApprove && (
                              <DropdownMenuItem
                                onClick={() => onApprove?.(s)}
                                className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400"
                              >
                                <CheckCircle2 className="size-3.5" />
                                Aprobar Solicitud
                              </DropdownMenuItem>
                            )}

                            {isPendiente && onReject && (
                              <DropdownMenuItem
                                onClick={() => onReject?.(s)}
                                className="gap-2 cursor-pointer text-rose-600 dark:text-rose-400"
                              >
                                <XCircle className="size-3.5" />
                                Rechazar Solicitud
                              </DropdownMenuItem>
                            )}

                            {isCancelable && onCancel && (
                              <DropdownMenuItem
                                onClick={() => onCancel?.(s)}
                                className="gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400"
                              >
                                <Ban className="size-3.5" />
                                Cancelar Solicitud
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {onViewAudit && (
                              <DropdownMenuItem
                                onClick={() => onViewAudit(s)}
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
                                  onClick={() => onDelete(s)}
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
