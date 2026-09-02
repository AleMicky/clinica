"use client";

import * as React from "react";
import {
  Trash2,
  Search,
  Plus,
  MoreVertical,
  Edit,
  CheckCircle2,
  Ban,
  Eye,
  Inbox,
  Clock,
  Download,
  Warehouse,
  ShieldCheck,
  X,
  CalendarX,
  AlertTriangle,
  Flame,
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
  EstadoBajaInventario,
  TipoBajaInventario,
  type BajaInventarioResponse,
} from "../types/baja-inventario.types";
import { AlmacenAutocomplete } from "../../almacen";

interface BajaInventarioListProps {
  bajas: BajaInventarioResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedAlmacenId?: number | null;
  selectedTipo?: TipoBajaInventario | null;
  selectedEstado?: EstadoBajaInventario | null;
  onSearchChange?: (value: string) => void;
  onAlmacenChange?: (almacenId: number | null) => void;
  onTipoChange?: (tipo: TipoBajaInventario | null) => void;
  onEstadoChange?: (estado: EstadoBajaInventario | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddBaja?: () => void;
  onViewDetail?: (baja: BajaInventarioResponse) => void;
  onEdit?: (baja: BajaInventarioResponse) => void;
  onConfirm?: (baja: BajaInventarioResponse) => void;
  onAnular?: (baja: BajaInventarioResponse) => void;
  onDelete?: (baja: BajaInventarioResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (baja: BajaInventarioResponse) => void;
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

export function getTipoBajaBadge(tipo: TipoBajaInventario) {
  switch (tipo) {
    case TipoBajaInventario.Vencimiento:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1"
        >
          <CalendarX className="size-2.5" />
          Vencimiento
        </Badge>
      );
    case TipoBajaInventario.Danio:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-orange-700 dark:text-orange-400 border-orange-500/30 bg-orange-500/10 gap-1"
        >
          <AlertTriangle className="size-2.5" />
          Daño / Rotura
        </Badge>
      );
    case TipoBajaInventario.Merma:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-purple-700 dark:text-purple-400 border-purple-500/30 bg-purple-500/10 gap-1"
        >
          <Flame className="size-2.5" />
          Merma
        </Badge>
      );
    default:
      return null;
  }
}

export function getEstadoBajaBadge(estado: EstadoBajaInventario) {
  switch (estado) {
    case EstadoBajaInventario.Borrador:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 gap-1"
        >
          <Clock className="size-2.5" />
          Borrador
        </Badge>
      );
    case EstadoBajaInventario.Confirmado:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
        >
          <CheckCircle2 className="size-2.5" />
          Confirmado
        </Badge>
      );
    case EstadoBajaInventario.Anulado:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 gap-1"
        >
          <Ban className="size-2.5" />
          Anulado
        </Badge>
      );
    default:
      return null;
  }
}

export function BajaInventarioList({
  bajas,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  selectedAlmacenId = null,
  selectedTipo = null,
  selectedEstado = null,
  onSearchChange,
  onAlmacenChange,
  onTipoChange,
  onEstadoChange,
  onPageChange,
  onPageSizeChange,
  onAddBaja,
  onViewDetail,
  onEdit,
  onConfirm,
  onAnular,
  onDelete,
  onRefresh,
  onViewAudit,
}: BajaInventarioListProps) {
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
      onEstadoChange?.(EstadoBajaInventario.Borrador);
    else if (val === "confirmado")
      onEstadoChange?.(EstadoBajaInventario.Confirmado);
    else if (val === "anulado")
      onEstadoChange?.(EstadoBajaInventario.Anulado);
  };

  const currentTab =
    selectedEstado === null
      ? "all"
      : selectedEstado === EstadoBajaInventario.Borrador
      ? "borrador"
      : selectedEstado === EstadoBajaInventario.Confirmado
      ? "confirmado"
      : "anulado";

  const handleExportCsv = () => {
    if (!bajas || bajas.length === 0) return;
    const headers = [
      "ID",
      "Número",
      "Almacén",
      "Tipo Baja",
      "Fecha",
      "Motivo",
      "Estado",
      "Cant. Items",
      "Observación",
    ];
    const rows = bajas.map((b) => [
      b.id,
      `"${b.numero.replace(/"/g, '""')}"`,
      `"${(b.almacenNombre || "").replace(/"/g, '""')}"`,
      b.tipo === TipoBajaInventario.Vencimiento
        ? "Vencimiento"
        : b.tipo === TipoBajaInventario.Danio
        ? "Daño / Rotura"
        : "Merma",
      `"${b.fecha}"`,
      `"${(b.motivo || "").replace(/"/g, '""')}"`,
      b.estado === EstadoBajaInventario.Borrador
        ? "Borrador"
        : b.estado === EstadoBajaInventario.Confirmado
        ? "Confirmado"
        : "Anulado",
      (b.detalles || []).length,
      `"${(b.observacion || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `bajas_inventario_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedAlmacenId !== null ||
    selectedTipo !== null ||
    selectedEstado !== null;

  return (
    <div className="flex flex-col gap-2.5 bg-card border border-border/60 rounded-lg p-3 shadow-2xs">
      {/* Top Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-2 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <Trash2 className="size-3.5 text-rose-600 dark:text-rose-400" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Listado de Bajas
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
                <Clock className="size-2 text-blue-500" />
                Borradores
              </TabsTrigger>
              <TabsTrigger
                value="confirmado"
                className="text-[10px] h-5.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1"
              >
                <CheckCircle2 className="size-2 text-emerald-500" />
                Confirmadas
              </TabsTrigger>
              <TabsTrigger
                value="anulado"
                className="text-[10px] h-5.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1"
              >
                <Ban className="size-2 text-rose-500" />
                Anuladas
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isLoading || bajas.length === 0}
            className="h-6.5 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Download className="size-2.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>

          {onAddBaja && (
            <Button
              size="sm"
              onClick={onAddBaja}
              className="h-6.5 px-2.5 text-[11px] bg-rose-600 hover:bg-rose-700 text-white gap-1 shadow-2xs cursor-pointer font-medium"
            >
              <Plus className="size-2.5" />
              <span>Nueva Baja</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar por número o motivo..."
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

        {/* Almacen Autocomplete */}
        <div className="w-full">
          <AlmacenAutocomplete
            value={selectedAlmacenId}
            onValueChange={(val) => onAlmacenChange?.(val)}
            placeholder="Filtrar por almacén..."
          />
        </div>

        {/* Tipo Filter Buttons */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={selectedTipo === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => onTipoChange?.(null)}
            className="h-7.5 px-2 text-[10.5px] cursor-pointer"
          >
            Todos tipos
          </Button>
          <Button
            type="button"
            variant={selectedTipo === TipoBajaInventario.Vencimiento ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onTipoChange?.(
                selectedTipo === TipoBajaInventario.Vencimiento
                  ? null
                  : TipoBajaInventario.Vencimiento
              )
            }
            className="h-7.5 px-2 text-[10.5px] gap-1 cursor-pointer"
          >
            <CalendarX className="size-3 text-amber-500" />
            <span>Vencimiento</span>
          </Button>
          <Button
            type="button"
            variant={selectedTipo === TipoBajaInventario.Danio ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onTipoChange?.(
                selectedTipo === TipoBajaInventario.Danio
                  ? null
                  : TipoBajaInventario.Danio
              )
            }
            className="h-7.5 px-2 text-[10.5px] gap-1 cursor-pointer"
          >
            <AlertTriangle className="size-3 text-orange-500" />
            <span>Daño</span>
          </Button>
        </div>

        {/* Reset filters */}
        <div className="flex items-center justify-end gap-1.5">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocalSearch("");
                onSearchChange?.("");
                onAlmacenChange?.(null);
                onTipoChange?.(null);
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
              <th className="px-2.5 py-2">Almacén</th>
              <th className="px-2.5 py-2 w-28">Tipo / Causa</th>
              <th className="px-2.5 py-2">Motivo</th>
              <th className="px-2.5 py-2 w-32">Fecha</th>
              <th className="px-2.5 py-2 w-24">Estado</th>
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
                    <Skeleton className="h-4.5 w-20 rounded-full" />
                  </td>
                  <td className="px-2.5 py-2">
                    <Skeleton className="h-3.5 w-32" />
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
            ) : bajas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Inbox className="size-4" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      No se encontraron bajas de inventario
                    </p>
                    <p className="text-[10px] text-muted-foreground max-w-xs">
                      {hasActiveFilters
                        ? "Intenta modificar los filtros de búsqueda o restablecerlos."
                        : "Registra descartes por vencimiento, daño o rotura de stock."}
                    </p>
                    {onAddBaja && (
                      <Button
                        size="sm"
                        onClick={onAddBaja}
                        className="mt-1 h-6.5 text-[11px] bg-rose-600 hover:bg-rose-700 text-white gap-1 cursor-pointer font-medium"
                      >
                        <Plus className="size-2.5" />
                        <span>Nueva Baja</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              bajas.map((baja) => {
                const isBorrador =
                  baja.estado === EstadoBajaInventario.Borrador;
                const isConfirmado =
                  baja.estado === EstadoBajaInventario.Confirmado;
                const isAnulado =
                  baja.estado === EstadoBajaInventario.Anulado;

                return (
                  <tr
                    key={baja.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => onViewDetail?.(baja)}
                  >
                    <td className="px-2.5 py-1.5">
                      <span className="font-mono font-bold text-foreground text-xs">
                        {baja.numero}
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Warehouse className="size-3 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{baja.almacenNombre || "-"}</span>
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5">{getTipoBajaBadge(baja.tipo)}</td>
                    <td className="px-2.5 py-1.5 font-medium text-foreground text-xs truncate max-w-xs">
                      {baja.motivo}
                    </td>
                    <td className="px-2.5 py-1.5 text-muted-foreground font-mono text-[10px]">
                      {formatDate(baja.fecha)}
                    </td>
                    <td className="px-2.5 py-1.5">
                      {getEstadoBajaBadge(baja.estado)}
                    </td>
                    <td className="px-2.5 py-1.5 text-center font-mono text-xs text-muted-foreground">
                      {(baja.detalles || []).length}
                    </td>
                    <td
                      className="px-2.5 py-1.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* Direct Action Button with distinctive colors */}
                        {isBorrador && onConfirm && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onConfirm(baja)}
                            className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-medium shadow-2xs cursor-pointer"
                            title="Confirmar y aplicar baja"
                          >
                            <CheckCircle2 className="size-2.5" />
                            <span>Confirmar</span>
                          </Button>
                        )}

                        {isConfirmado && onAnular && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onAnular(baja)}
                            className="h-6 px-2 text-[10px] bg-rose-600 hover:bg-rose-700 text-white gap-1 font-medium shadow-2xs cursor-pointer"
                            title="Anular baja"
                          >
                            <Ban className="size-2.5" />
                            <span>Anular</span>
                          </Button>
                        )}

                        {isAnulado && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetail?.(baja)}
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
                            aria-label={`Acciones de ${baja.numero}`}
                          >
                            <MoreVertical className="size-3" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuItem
                              onClick={() => onViewDetail?.(baja)}
                              className="gap-1.5 cursor-pointer text-xs"
                            >
                              <Eye className="size-3 text-blue-500" />
                              <span>Ver Comprobante</span>
                            </DropdownMenuItem>

                            {isBorrador && onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit(baja)}
                                className="gap-1.5 cursor-pointer text-xs text-amber-600 dark:text-amber-400 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-950/40"
                              >
                                <Edit className="size-3 text-amber-500" />
                                <span>Editar Borrador</span>
                              </DropdownMenuItem>
                            )}

                            {isBorrador && onConfirm && (
                              <DropdownMenuItem
                                onClick={() => onConfirm(baja)}
                                className="gap-1.5 text-emerald-600 dark:text-emerald-400 focus:text-emerald-700 focus:bg-emerald-50 dark:focus:bg-emerald-950/40 cursor-pointer text-xs font-medium"
                              >
                                <CheckCircle2 className="size-3 text-emerald-500" />
                                <span>Confirmar Baja</span>
                              </DropdownMenuItem>
                            )}

                            {isConfirmado && onAnular && (
                              <DropdownMenuItem
                                onClick={() => onAnular(baja)}
                                className="gap-1.5 text-rose-600 dark:text-rose-400 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/40 cursor-pointer text-xs font-medium"
                              >
                                <Ban className="size-3 text-rose-500" />
                                <span>Anular</span>
                              </DropdownMenuItem>
                            )}

                            {isBorrador && onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDelete(baja)}
                                  className="gap-1.5 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs"
                                >
                                  <Trash2 className="size-3" />
                                  <span>Eliminar Borrador</span>
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onViewAudit?.(baja)}
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
