"use client";

import * as React from "react";
import {
  GitCompareArrows,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Ban,
  Eye,
  Inbox,
  Clock,
  Download,
  Warehouse,
  ShieldCheck,
  X,
  Send,
  Truck,
  PackageCheck,
  ArrowRight,
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
  EstadoTransferenciaAlmacen,
  type TransferenciaAlmacenResponse,
} from "../types/transferencia-almacen.types";
import { AlmacenAutocomplete } from "../../almacen";

interface TransferenciaAlmacenListProps {
  transferencias: TransferenciaAlmacenResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedAlmacenOrigenId?: number | null;
  selectedAlmacenDestinoId?: number | null;
  selectedEstado?: EstadoTransferenciaAlmacen | null;
  onSearchChange?: (value: string) => void;
  onAlmacenOrigenChange?: (almacenId: number | null) => void;
  onAlmacenDestinoChange?: (almacenId: number | null) => void;
  onEstadoChange?: (estado: EstadoTransferenciaAlmacen | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddTransferencia?: () => void;
  onViewDetail?: (transferencia: TransferenciaAlmacenResponse) => void;
  onEdit?: (transferencia: TransferenciaAlmacenResponse) => void;
  onSolicitar?: (transferencia: TransferenciaAlmacenResponse) => void;
  onAprobar?: (transferencia: TransferenciaAlmacenResponse) => void;
  onDespachar?: (transferencia: TransferenciaAlmacenResponse) => void;
  onRecibir?: (transferencia: TransferenciaAlmacenResponse) => void;
  onCancelar?: (transferencia: TransferenciaAlmacenResponse) => void;
  onDelete?: (transferencia: TransferenciaAlmacenResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (transferencia: TransferenciaAlmacenResponse) => void;
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

export function getEstadoTransferenciaBadge(estado: EstadoTransferenciaAlmacen) {
  switch (estado) {
    case EstadoTransferenciaAlmacen.Borrador:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1"
        >
          <Clock className="size-2.5" />
          Borrador
        </Badge>
      );
    case EstadoTransferenciaAlmacen.Solicitado:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 gap-1"
        >
          <Send className="size-2.5" />
          Solicitado
        </Badge>
      );
    case EstadoTransferenciaAlmacen.Aprobado:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/10 gap-1"
        >
          <CheckCircle2 className="size-2.5" />
          Aprobado
        </Badge>
      );
    case EstadoTransferenciaAlmacen.Despachado:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10 gap-1"
        >
          <Truck className="size-2.5" />
          Despachado
        </Badge>
      );
    case EstadoTransferenciaAlmacen.Recibido:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
        >
          <PackageCheck className="size-2.5" />
          Recibido
        </Badge>
      );
    case EstadoTransferenciaAlmacen.Cancelado:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 gap-1"
        >
          <Ban className="size-2.5" />
          Cancelado
        </Badge>
      );
    default:
      return null;
  }
}

export function TransferenciaAlmacenList({
  transferencias,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  selectedAlmacenOrigenId = null,
  selectedAlmacenDestinoId = null,
  selectedEstado = null,
  onSearchChange,
  onAlmacenOrigenChange,
  onAlmacenDestinoChange,
  onEstadoChange,
  onPageChange,
  onPageSizeChange,
  onAddTransferencia,
  onViewDetail,
  onEdit,
  onSolicitar,
  onAprobar,
  onDespachar,
  onRecibir,
  onCancelar,
  onDelete,
  onRefresh,
  onViewAudit,
}: TransferenciaAlmacenListProps) {
  const [localSearch, setLocalSearch] = React.useState(searchTerm);

  React.useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(localSearch);
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearchChange?.("");
  };

  const handleTabChange = (val: string) => {
    if (val === "all") onEstadoChange?.(null);
    else if (val === "borrador")
      onEstadoChange?.(EstadoTransferenciaAlmacen.Borrador);
    else if (val === "solicitado")
      onEstadoChange?.(EstadoTransferenciaAlmacen.Solicitado);
    else if (val === "aprobado")
      onEstadoChange?.(EstadoTransferenciaAlmacen.Aprobado);
    else if (val === "despachado")
      onEstadoChange?.(EstadoTransferenciaAlmacen.Despachado);
    else if (val === "recibido")
      onEstadoChange?.(EstadoTransferenciaAlmacen.Recibido);
    else if (val === "cancelado")
      onEstadoChange?.(EstadoTransferenciaAlmacen.Cancelado);
  };

  const currentTab =
    selectedEstado === null
      ? "all"
      : selectedEstado === EstadoTransferenciaAlmacen.Borrador
      ? "borrador"
      : selectedEstado === EstadoTransferenciaAlmacen.Solicitado
      ? "solicitado"
      : selectedEstado === EstadoTransferenciaAlmacen.Aprobado
      ? "aprobado"
      : selectedEstado === EstadoTransferenciaAlmacen.Despachado
      ? "despachado"
      : selectedEstado === EstadoTransferenciaAlmacen.Recibido
      ? "recibido"
      : "cancelado";

  const handleExportCsv = () => {
    if (!transferencias || transferencias.length === 0) return;
    const headers = [
      "ID",
      "Número",
      "Origen",
      "Destino",
      "Fecha Solicitud",
      "Estado",
      "Cant. Items",
      "Observación",
    ];
    const rows = transferencias.map((t) => [
      t.id,
      `"${t.numero.replace(/"/g, '""')}"`,
      `"${(t.almacenOrigenNombre || "").replace(/"/g, '""')}"`,
      `"${(t.almacenDestinoNombre || "").replace(/"/g, '""')}"`,
      `"${t.fechaSolicitud}"`,
      getEstadoTransferenciaNombre(t.estado),
      (t.detalles || []).length,
      `"${(t.observacion || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `transferencias_almacen_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedAlmacenOrigenId !== null ||
    selectedAlmacenDestinoId !== null ||
    selectedEstado !== null;

  return (
    <div className="flex flex-col gap-2.5 bg-card border border-border/60 rounded-lg p-3 shadow-2xs">
      {/* Top Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-2 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <GitCompareArrows className="size-3.5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Listado de Transferencias
          </h2>
          <span className="text-[10px] text-muted-foreground font-mono">
            ({totalItems})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className="w-auto"
          >
            <TabsList className="h-6.5 bg-muted/60 p-0.5 border border-border/40">
              <TabsTrigger
                value="all"
                className="text-[10px] h-5.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-xs"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="borrador"
                className="text-[10px] h-5.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1"
              >
                <Clock className="size-2 text-amber-500" />
                Borradores
              </TabsTrigger>
              <TabsTrigger
                value="solicitado"
                className="text-[10px] h-5.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1"
              >
                <Send className="size-2 text-blue-500" />
                Solicitados
              </TabsTrigger>
              <TabsTrigger
                value="aprobado"
                className="text-[10px] h-5.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1"
              >
                <CheckCircle2 className="size-2 text-indigo-500" />
                Aprobados
              </TabsTrigger>
              <TabsTrigger
                value="despachado"
                className="text-[10px] h-5.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1"
              >
                <Truck className="size-2 text-purple-500" />
                Despachados
              </TabsTrigger>
              <TabsTrigger
                value="recibido"
                className="text-[10px] h-5.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1"
              >
                <PackageCheck className="size-2 text-emerald-500" />
                Recibidos
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isLoading || transferencias.length === 0}
            className="h-6.5 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Download className="size-2.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>

          {onAddTransferencia && (
            <Button
              size="sm"
              onClick={onAddTransferencia}
              className="h-6.5 px-2.5 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white gap-1 shadow-2xs cursor-pointer font-medium"
            >
              <Plus className="size-2.5" />
              <span>Nueva Transferencia</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar por número u obs..."
            className="h-7.5 pl-7.5 pr-7 text-xs bg-background/60 border-input shadow-2xs"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="size-2.5" />
            </button>
          )}
        </form>

        {/* Almacen Origen */}
        <div className="w-full">
          <AlmacenAutocomplete
            value={selectedAlmacenOrigenId}
            onValueChange={(val) => onAlmacenOrigenChange?.(val)}
            placeholder="Filtrar por origen..."
          />
        </div>

        {/* Almacen Destino */}
        <div className="w-full">
          <AlmacenAutocomplete
            value={selectedAlmacenDestinoId}
            onValueChange={(val) => onAlmacenDestinoChange?.(val)}
            placeholder="Filtrar por destino..."
          />
        </div>

        {/* Reset filters */}
        <div className="flex items-center gap-1.5">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocalSearch("");
                onSearchChange?.("");
                onAlmacenOrigenChange?.(null);
                onAlmacenDestinoChange?.(null);
                onEstadoChange?.(null);
              }}
              className="h-7.5 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="size-2.5" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border/40 bg-background/50">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold text-[11px]">
              <th className="px-2.5 py-2 w-32">Número</th>
              <th className="px-2.5 py-2">Origen</th>
              <th className="px-2.5 py-2">Destino</th>
              <th className="px-2.5 py-2 w-32">Fecha Solicitud</th>
              <th className="px-2.5 py-2 w-28">Estado</th>
              <th className="px-2.5 py-2 w-20 text-center">Items</th>
              <th className="px-2.5 py-2 w-36 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="px-2.5 py-2">
                    <Skeleton className="h-3.5 w-24" />
                  </td>
                  <td className="px-2.5 py-2">
                    <Skeleton className="h-3.5 w-28" />
                  </td>
                  <td className="px-2.5 py-2">
                    <Skeleton className="h-3.5 w-28" />
                  </td>
                  <td className="px-2.5 py-2">
                    <Skeleton className="h-3.5 w-20" />
                  </td>
                  <td className="px-2.5 py-2">
                    <Skeleton className="h-4.5 w-16 rounded-full" />
                  </td>
                  <td className="px-2.5 py-2 text-center">
                    <Skeleton className="h-3.5 w-8 mx-auto" />
                  </td>
                  <td className="px-2.5 py-2 text-right">
                    <Skeleton className="h-5 w-16 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : transferencias.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Inbox className="size-4" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      No se encontraron transferencias
                    </p>
                    <p className="text-[10px] text-muted-foreground max-w-xs">
                      {hasActiveFilters
                        ? "Intenta modificar los filtros de búsqueda o restablecerlos."
                        : "Comienza registrando tu primera transferencia entre almacenes."}
                    </p>
                    {onAddTransferencia && (
                      <Button
                        size="sm"
                        onClick={onAddTransferencia}
                        className="mt-1 h-6.5 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white gap-1 font-medium shadow-2xs cursor-pointer"
                      >
                        <Plus className="size-2.5" />
                        <span>Nueva Transferencia</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              transferencias.map((transf) => {
                const isBorrador =
                  transf.estado === EstadoTransferenciaAlmacen.Borrador;
                const isSolicitado =
                  transf.estado === EstadoTransferenciaAlmacen.Solicitado;
                const isAprobado =
                  transf.estado === EstadoTransferenciaAlmacen.Aprobado;
                const isDespachado =
                  transf.estado === EstadoTransferenciaAlmacen.Despachado;
                const isFinalizado =
                  transf.estado === EstadoTransferenciaAlmacen.Recibido ||
                  transf.estado === EstadoTransferenciaAlmacen.Cancelado;

                return (
                  <tr
                    key={transf.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => onViewDetail?.(transf)}
                  >
                    <td className="px-2.5 py-1.5">
                      <span className="font-mono font-bold text-foreground text-xs">
                        {transf.numero}
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Warehouse className="size-3 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{transf.almacenOrigenNombre || "-"}</span>
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Warehouse className="size-3 text-primary shrink-0" />
                        <span className="truncate">{transf.almacenDestinoNombre || "-"}</span>
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5 text-muted-foreground font-mono text-[10px]">
                      {formatDate(transf.fechaSolicitud)}
                    </td>
                    <td className="px-2.5 py-1.5">
                      {getEstadoTransferenciaBadge(transf.estado)}
                    </td>
                    <td className="px-2.5 py-1.5 text-center font-mono text-xs text-muted-foreground">
                      {(transf.detalles || []).length}
                    </td>
                    <td
                      className="px-2.5 py-1.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* Direct Action Button with distinctive colors */}
                        {isBorrador && onSolicitar && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onSolicitar(transf)}
                            className="h-6 px-2 text-[10px] bg-blue-600 hover:bg-blue-700 text-white gap-1 font-medium shadow-2xs cursor-pointer"
                            title="Solicitar Aprobación"
                          >
                            <Send className="size-2.5" />
                            <span>Solicitar</span>
                          </Button>
                        )}

                        {isSolicitado && onAprobar && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onAprobar(transf)}
                            className="h-6 px-2 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white gap-1 font-medium shadow-2xs cursor-pointer"
                            title="Aprobar Transferencia"
                          >
                            <CheckCircle2 className="size-2.5" />
                            <span>Aprobar</span>
                          </Button>
                        )}

                        {isAprobado && onDespachar && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onDespachar(transf)}
                            className="h-6 px-2 text-[10px] bg-purple-600 hover:bg-purple-700 text-white gap-1 font-medium shadow-2xs cursor-pointer"
                            title="Despachar Mercadería"
                          >
                            <Truck className="size-2.5" />
                            <span>Despachar</span>
                          </Button>
                        )}

                        {isDespachado && onRecibir && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onRecibir(transf)}
                            className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium shadow-2xs cursor-pointer"
                            title="Recibir Mercadería"
                          >
                            <PackageCheck className="size-2.5" />
                            <span>Recibir</span>
                          </Button>
                        )}

                        {isFinalizado && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetail?.(transf)}
                            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground gap-1 font-medium cursor-pointer"
                            title="Ver Detalle"
                          >
                            <Eye className="size-2.5" />
                            <span>Ver</span>
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                            aria-label={`Acciones de ${transf.numero}`}
                          >
                            <MoreVertical className="size-3" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuItem
                              onClick={() => onViewDetail?.(transf)}
                              className="gap-1.5 cursor-pointer text-xs"
                            >
                              <Eye className="size-3 text-blue-500" />
                              <span>Ver Detalle y Guía</span>
                            </DropdownMenuItem>

                            {isBorrador && onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit(transf)}
                                className="gap-1.5 cursor-pointer text-xs text-amber-600 dark:text-amber-400 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-950/40"
                              >
                                <Edit className="size-3 text-amber-500" />
                                <span>Editar Borrador</span>
                              </DropdownMenuItem>
                            )}

                            {isBorrador && onSolicitar && (
                              <DropdownMenuItem
                                onClick={() => onSolicitar(transf)}
                                className="gap-1.5 text-blue-600 dark:text-blue-400 focus:text-blue-700 focus:bg-blue-50 dark:focus:bg-blue-950/40 cursor-pointer text-xs font-medium"
                              >
                                <Send className="size-3 text-blue-500" />
                                <span>Solicitar Envío</span>
                              </DropdownMenuItem>
                            )}

                            {isSolicitado && onAprobar && (
                              <DropdownMenuItem
                                onClick={() => onAprobar(transf)}
                                className="gap-1.5 text-indigo-600 dark:text-indigo-400 focus:text-indigo-700 focus:bg-indigo-50 dark:focus:bg-indigo-950/40 cursor-pointer text-xs font-medium"
                              >
                                <CheckCircle2 className="size-3 text-indigo-500" />
                                <span>Aprobar Transferencia</span>
                              </DropdownMenuItem>
                            )}

                            {isAprobado && onDespachar && (
                              <DropdownMenuItem
                                onClick={() => onDespachar(transf)}
                                className="gap-1.5 text-purple-600 dark:text-purple-400 focus:text-purple-700 focus:bg-purple-50 dark:focus:bg-purple-950/40 cursor-pointer text-xs font-medium"
                              >
                                <Truck className="size-3 text-purple-500" />
                                <span>Despachar Stock</span>
                              </DropdownMenuItem>
                            )}

                            {isDespachado && onRecibir && (
                              <DropdownMenuItem
                                onClick={() => onRecibir(transf)}
                                className="gap-1.5 text-emerald-600 dark:text-emerald-400 focus:text-emerald-700 focus:bg-emerald-50 dark:focus:bg-emerald-950/40 cursor-pointer text-xs font-medium"
                              >
                                <PackageCheck className="size-3 text-emerald-500" />
                                <span>Recibir Mercancía</span>
                              </DropdownMenuItem>
                            )}

                            {!isFinalizado && onCancelar && (
                              <DropdownMenuItem
                                onClick={() => onCancelar(transf)}
                                className="gap-1.5 text-rose-600 dark:text-rose-400 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/40 cursor-pointer text-xs"
                              >
                                <Ban className="size-3 text-rose-500" />
                                <span>Cancelar</span>
                              </DropdownMenuItem>
                            )}

                            {isBorrador && onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDelete(transf)}
                                  className="gap-1.5 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs"
                                >
                                  <Trash2 className="size-3" />
                                  <span>Eliminar Borrador</span>
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onViewAudit?.(transf)}
                              className="gap-1.5 text-muted-foreground cursor-pointer text-xs"
                            >
                              <ShieldCheck className="size-3" />
                              <span>Ver Auditoría</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
        <DataTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}

function getEstadoTransferenciaNombre(estado: EstadoTransferenciaAlmacen) {
  switch (estado) {
    case EstadoTransferenciaAlmacen.Borrador:
      return "Borrador";
    case EstadoTransferenciaAlmacen.Solicitado:
      return "Solicitado";
    case EstadoTransferenciaAlmacen.Aprobado:
      return "Aprobado";
    case EstadoTransferenciaAlmacen.Despachado:
      return "Despachado";
    case EstadoTransferenciaAlmacen.Recibido:
      return "Recibido";
    case EstadoTransferenciaAlmacen.Cancelado:
      return "Cancelado";
    default:
      return "-";
  }
}
