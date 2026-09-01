"use client";

import * as React from "react";
import {
  SlidersHorizontal,
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
  ArrowDownLeft,
  ArrowUpRight,
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
  EstadoAjusteInventario,
  TipoAjusteInventario,
  type AjusteInventarioResponse,
} from "../types/ajuste-inventario.types";
import { AlmacenAutocomplete } from "../../almacen";

interface AjusteInventarioListProps {
  ajustes: AjusteInventarioResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedAlmacenId?: number | null;
  selectedTipo?: TipoAjusteInventario | null;
  selectedEstado?: EstadoAjusteInventario | null;
  onSearchChange?: (value: string) => void;
  onAlmacenChange?: (almacenId: number | null) => void;
  onTipoChange?: (tipo: TipoAjusteInventario | null) => void;
  onEstadoChange?: (estado: EstadoAjusteInventario | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddAjuste?: () => void;
  onViewDetail?: (ajuste: AjusteInventarioResponse) => void;
  onEdit?: (ajuste: AjusteInventarioResponse) => void;
  onConfirm?: (ajuste: AjusteInventarioResponse) => void;
  onAnular?: (ajuste: AjusteInventarioResponse) => void;
  onDelete?: (ajuste: AjusteInventarioResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (ajuste: AjusteInventarioResponse) => void;
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

export function getTipoAjusteBadge(tipo: TipoAjusteInventario) {
  switch (tipo) {
    case TipoAjusteInventario.Positivo:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
        >
          <ArrowDownLeft className="size-2.5" />
          Positivo (+ Stock)
        </Badge>
      );
    case TipoAjusteInventario.Negativo:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1"
        >
          <ArrowUpRight className="size-2.5" />
          Negativo (- Stock)
        </Badge>
      );
    default:
      return null;
  }
}

export function getEstadoAjusteBadge(estado: EstadoAjusteInventario) {
  switch (estado) {
    case EstadoAjusteInventario.Borrador:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 gap-1"
        >
          <Clock className="size-2.5" />
          Borrador
        </Badge>
      );
    case EstadoAjusteInventario.Confirmado:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
        >
          <CheckCircle2 className="size-2.5" />
          Confirmado
        </Badge>
      );
    case EstadoAjusteInventario.Anulado:
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

export function AjusteInventarioList({
  ajustes,
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
  onAddAjuste,
  onViewDetail,
  onEdit,
  onConfirm,
  onAnular,
  onDelete,
  onRefresh,
  onViewAudit,
}: AjusteInventarioListProps) {
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
      onEstadoChange?.(EstadoAjusteInventario.Borrador);
    else if (val === "confirmado")
      onEstadoChange?.(EstadoAjusteInventario.Confirmado);
    else if (val === "anulado")
      onEstadoChange?.(EstadoAjusteInventario.Anulado);
  };

  const currentTab =
    selectedEstado === null
      ? "all"
      : selectedEstado === EstadoAjusteInventario.Borrador
      ? "borrador"
      : selectedEstado === EstadoAjusteInventario.Confirmado
      ? "confirmado"
      : "anulado";

  const handleExportCsv = () => {
    if (!ajustes || ajustes.length === 0) return;
    const headers = [
      "ID",
      "Número",
      "Almacén",
      "Tipo Ajuste",
      "Fecha",
      "Motivo",
      "Estado",
      "Cant. Items",
      "Observación",
    ];
    const rows = ajustes.map((a) => [
      a.id,
      `"${a.numero.replace(/"/g, '""')}"`,
      `"${(a.almacenNombre || "").replace(/"/g, '""')}"`,
      a.tipo === TipoAjusteInventario.Positivo ? "Positivo (+)" : "Negativo (-)",
      `"${a.fecha}"`,
      `"${(a.motivo || "").replace(/"/g, '""')}"`,
      a.estado === EstadoAjusteInventario.Borrador
        ? "Borrador"
        : a.estado === EstadoAjusteInventario.Confirmado
        ? "Confirmado"
        : "Anulado",
      (a.detalles || []).length,
      `"${(a.observacion || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ajustes_inventario_${new Date().toISOString().split("T")[0]}.csv`
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
          <SlidersHorizontal className="size-3.5 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Listado de Ajustes
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
                Confirmados
              </TabsTrigger>
              <TabsTrigger
                value="anulado"
                className="text-[10px] h-5.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1"
              >
                <Ban className="size-2 text-rose-500" />
                Anulados
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isLoading || ajustes.length === 0}
            className="h-6.5 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Download className="size-2.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>

          {onAddAjuste && (
            <Button
              size="sm"
              onClick={onAddAjuste}
              className="h-6.5 px-2.5 text-[11px] bg-primary hover:bg-primary/90 text-primary-foreground gap-1 shadow-2xs cursor-pointer font-medium"
            >
              <Plus className="size-2.5" />
              <span>Nuevo Ajuste</span>
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
            variant={selectedTipo === TipoAjusteInventario.Positivo ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onTipoChange?.(
                selectedTipo === TipoAjusteInventario.Positivo
                  ? null
                  : TipoAjusteInventario.Positivo
              )
            }
            className="h-7.5 px-2 text-[10.5px] gap-1 cursor-pointer"
          >
            <ArrowDownLeft className="size-3 text-emerald-500" />
            <span>Positivo (+)</span>
          </Button>
          <Button
            type="button"
            variant={selectedTipo === TipoAjusteInventario.Negativo ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onTipoChange?.(
                selectedTipo === TipoAjusteInventario.Negativo
                  ? null
                  : TipoAjusteInventario.Negativo
              )
            }
            className="h-7.5 px-2 text-[10.5px] gap-1 cursor-pointer"
          >
            <ArrowUpRight className="size-3 text-amber-500" />
            <span>Negativo (-)</span>
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
              <th className="px-2.5 py-2 w-28">Tipo</th>
              <th className="px-2.5 py-2">Motivo</th>
              <th className="px-2.5 py-2 w-32">Fecha</th>
              <th className="px-2.5 py-2 w-24">Estado</th>
              <th className="px-2.5 py-2 w-20 text-center">Items</th>
              <th className="px-2.5 py-2 w-12 text-right">Acciones</th>
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
                    <Skeleton className="h-5 w-5 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : ajustes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Inbox className="size-4" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      No se encontraron ajustes de inventario
                    </p>
                    <p className="text-[10px] text-muted-foreground max-w-xs">
                      {hasActiveFilters
                        ? "Intenta modificar los filtros de búsqueda o restablecerlos."
                        : "Comienza registrando tu primer ajuste positivo o negativo de stock."}
                    </p>
                    {onAddAjuste && (
                      <Button
                        size="sm"
                        onClick={onAddAjuste}
                        className="mt-1 h-6.5 text-[11px] bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                      >
                        <Plus className="size-2.5" />
                        <span>Nuevo Ajuste</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              ajustes.map((ajuste) => {
                const isBorrador =
                  ajuste.estado === EstadoAjusteInventario.Borrador;
                const isConfirmado =
                  ajuste.estado === EstadoAjusteInventario.Confirmado;
                const isAnulado =
                  ajuste.estado === EstadoAjusteInventario.Anulado;

                return (
                  <tr
                    key={ajuste.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => onViewDetail?.(ajuste)}
                  >
                    <td className="px-2.5 py-1.5">
                      <span className="font-mono font-bold text-foreground text-xs">
                        {ajuste.numero}
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Warehouse className="size-3 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{ajuste.almacenNombre || "-"}</span>
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5">{getTipoAjusteBadge(ajuste.tipo)}</td>
                    <td className="px-2.5 py-1.5 font-medium text-foreground text-xs truncate max-w-xs">
                      {ajuste.motivo}
                    </td>
                    <td className="px-2.5 py-1.5 text-muted-foreground font-mono text-[10px]">
                      {formatDate(ajuste.fecha)}
                    </td>
                    <td className="px-2.5 py-1.5">
                      {getEstadoAjusteBadge(ajuste.estado)}
                    </td>
                    <td className="px-2.5 py-1.5 text-center font-mono text-xs text-muted-foreground">
                      {(ajuste.detalles || []).length}
                    </td>
                    <td
                      className="px-2.5 py-1.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                          aria-label={`Acciones de ${ajuste.numero}`}
                        >
                          <MoreVertical className="size-3" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 text-xs">
                          <DropdownMenuItem
                            onClick={() => onViewDetail?.(ajuste)}
                            className="gap-1.5 cursor-pointer text-xs"
                          >
                            <Eye className="size-3 text-blue-500" />
                            <span>Ver Comprobante</span>
                          </DropdownMenuItem>

                          {isBorrador && onEdit && (
                            <DropdownMenuItem
                              onClick={() => onEdit(ajuste)}
                              className="gap-1.5 cursor-pointer text-xs"
                            >
                              <Edit className="size-3 text-amber-500" />
                              <span>Editar Borrador</span>
                            </DropdownMenuItem>
                          )}

                          {isBorrador && onConfirm && (
                            <DropdownMenuItem
                              onClick={() => onConfirm(ajuste)}
                              className="gap-1.5 text-emerald-600 focus:text-emerald-600 cursor-pointer text-xs"
                            >
                              <CheckCircle2 className="size-3 text-emerald-500" />
                              <span>Confirmar Ajuste</span>
                            </DropdownMenuItem>
                          )}

                          {isConfirmado && onAnular && (
                            <DropdownMenuItem
                              onClick={() => onAnular(ajuste)}
                              className="gap-1.5 text-rose-600 focus:text-rose-600 cursor-pointer text-xs"
                            >
                              <Ban className="size-3 text-rose-500" />
                              <span>Anular</span>
                            </DropdownMenuItem>
                          )}

                          {isBorrador && onDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDelete(ajuste)}
                                className="gap-1.5 text-destructive focus:text-destructive cursor-pointer text-xs"
                              >
                                <Trash2 className="size-3" />
                                <span>Eliminar Borrador</span>
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onViewAudit?.(ajuste)}
                            className="gap-1.5 text-muted-foreground cursor-pointer text-xs"
                          >
                            <ShieldCheck className="size-3" />
                            <span>Ver Auditoría</span>
                          </DropdownMenuItem>
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
