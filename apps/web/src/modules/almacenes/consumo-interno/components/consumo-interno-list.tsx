"use client";

import * as React from "react";
import {
  Utensils,
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
  Building2,
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
  EstadoConsumoInterno,
  type ConsumoInternoResponse,
} from "../types/consumo-interno.types";
import { AlmacenAutocomplete } from "../../almacen";
import { AreaTreeSelect } from "@/modules/recursos-humanos/area/components/area-tree-select";

interface ConsumoInternoListProps {
  consumos: ConsumoInternoResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedAlmacenId?: number | null;
  selectedAreaId?: number | null;
  selectedEstado?: EstadoConsumoInterno | null;
  onSearchChange?: (value: string) => void;
  onAlmacenChange?: (almacenId: number | null) => void;
  onAreaChange?: (areaId: number | null) => void;
  onEstadoChange?: (estado: EstadoConsumoInterno | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddConsumo?: () => void;
  onViewDetail?: (consumo: ConsumoInternoResponse) => void;
  onEdit?: (consumo: ConsumoInternoResponse) => void;
  onConfirm?: (consumo: ConsumoInternoResponse) => void;
  onAnular?: (consumo: ConsumoInternoResponse) => void;
  onDelete?: (consumo: ConsumoInternoResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (consumo: ConsumoInternoResponse) => void;
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

export function getEstadoConsumoBadge(estado: EstadoConsumoInterno) {
  switch (estado) {
    case EstadoConsumoInterno.Borrador:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 gap-1"
        >
          <Clock className="size-2.5" />
          Borrador
        </Badge>
      );
    case EstadoConsumoInterno.Confirmado:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
        >
          <CheckCircle2 className="size-2.5" />
          Confirmado / Despachado
        </Badge>
      );
    case EstadoConsumoInterno.Anulado:
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

export function ConsumoInternoList({
  consumos,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  selectedAlmacenId = null,
  selectedAreaId = null,
  selectedEstado = null,
  onSearchChange,
  onAlmacenChange,
  onAreaChange,
  onEstadoChange,
  onPageChange,
  onPageSizeChange,
  onAddConsumo,
  onViewDetail,
  onEdit,
  onConfirm,
  onAnular,
  onDelete,
  onRefresh,
  onViewAudit,
}: ConsumoInternoListProps) {
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
      onEstadoChange?.(EstadoConsumoInterno.Borrador);
    else if (val === "confirmado")
      onEstadoChange?.(EstadoConsumoInterno.Confirmado);
    else if (val === "anulado")
      onEstadoChange?.(EstadoConsumoInterno.Anulado);
  };

  const currentTab =
    selectedEstado === null
      ? "all"
      : selectedEstado === EstadoConsumoInterno.Borrador
      ? "borrador"
      : selectedEstado === EstadoConsumoInterno.Confirmado
      ? "confirmado"
      : "anulado";

  const handleExportCsv = () => {
    if (!consumos || consumos.length === 0) return;
    const headers = [
      "ID",
      "Número",
      "Almacén",
      "Área Solicitante",
      "Fecha",
      "Estado",
      "Referencia Tipo",
      "Referencia ID",
      "Cant. Items",
      "Observación",
    ];
    const rows = consumos.map((c) => [
      c.id,
      `"${c.numero.replace(/"/g, '""')}"`,
      `"${(c.almacenNombre || "").replace(/"/g, '""')}"`,
      `"${(c.areaNombre || "").replace(/"/g, '""')}"`,
      `"${c.fecha}"`,
      c.estado === EstadoConsumoInterno.Borrador
        ? "Borrador"
        : c.estado === EstadoConsumoInterno.Confirmado
        ? "Confirmado"
        : "Anulado",
      `"${c.referenciaTipo || ""}"`,
      c.referenciaId || "",
      (c.detalles || []).length,
      `"${(c.observacion || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `consumos_interno_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedAlmacenId !== null ||
    selectedAreaId !== null ||
    selectedEstado !== null;

  return (
    <div className="flex flex-col gap-2.5 bg-card border border-border/60 rounded-lg p-3 shadow-2xs">
      {/* Top Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-2 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <Utensils className="size-3.5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Listado de Consumos
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
            disabled={isLoading || consumos.length === 0}
            className="h-6.5 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Download className="size-2.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>

          {onAddConsumo && (
            <Button
              size="sm"
              onClick={onAddConsumo}
              className="h-6.5 px-2.5 text-[11px] bg-teal-600 hover:bg-teal-700 text-white gap-1 shadow-2xs cursor-pointer font-medium"
            >
              <Plus className="size-2.5" />
              <span>Nuevo Vale</span>
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
            placeholder="Buscar por número..."
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

        {/* Area Autocomplete */}
        <div className="w-full">
          <AreaTreeSelect
            value={selectedAreaId}
            onValueChange={(val) => onAreaChange?.(val || null)}
            placeholder="Filtrar por área..."
          />
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
                onAreaChange?.(null);
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
              <th className="px-2.5 py-2">Almacén Emisor</th>
              <th className="px-2.5 py-2">Área Solicitante</th>
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
                    <Skeleton className="h-5 w-5 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : consumos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Inbox className="size-4" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      No se encontraron vales de consumo interno
                    </p>
                    <p className="text-[10px] text-muted-foreground max-w-xs">
                      {hasActiveFilters
                        ? "Intenta modificar los filtros de búsqueda o restablecerlos."
                        : "Registra despachos de materiales e insumos a áreas y servicios de la clínica."}
                    </p>
                    {onAddConsumo && (
                      <Button
                        size="sm"
                        onClick={onAddConsumo}
                        className="mt-1 h-6.5 text-[11px] bg-teal-600 hover:bg-teal-700 text-white gap-1"
                      >
                        <Plus className="size-2.5" />
                        <span>Nuevo Vale</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              consumos.map((consumo) => {
                const isBorrador =
                  consumo.estado === EstadoConsumoInterno.Borrador;
                const isConfirmado =
                  consumo.estado === EstadoConsumoInterno.Confirmado;
                const isAnulado =
                  consumo.estado === EstadoConsumoInterno.Anulado;

                return (
                  <tr
                    key={consumo.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => onViewDetail?.(consumo)}
                  >
                    <td className="px-2.5 py-1.5">
                      <span className="font-mono font-bold text-foreground text-xs">
                        {consumo.numero}
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Warehouse className="size-3 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{consumo.almacenNombre || "-"}</span>
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs font-medium text-foreground">
                        <Building2 className="size-3 text-teal-600 shrink-0" />
                        <span className="truncate">{consumo.areaNombre || "-"}</span>
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5 text-muted-foreground font-mono text-[10px]">
                      {formatDate(consumo.fecha)}
                    </td>
                    <td className="px-2.5 py-1.5">
                      {getEstadoConsumoBadge(consumo.estado)}
                    </td>
                    <td className="px-2.5 py-1.5 text-center font-mono text-xs text-muted-foreground">
                      {(consumo.detalles || []).length}
                    </td>
                    <td
                      className="px-2.5 py-1.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                          aria-label={`Acciones de ${consumo.numero}`}
                        >
                          <MoreVertical className="size-3" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 text-xs">
                          <DropdownMenuItem
                            onClick={() => onViewDetail?.(consumo)}
                            className="gap-1.5 cursor-pointer text-xs"
                          >
                            <Eye className="size-3 text-blue-500" />
                            <span>Ver Vale</span>
                          </DropdownMenuItem>

                          {isBorrador && onEdit && (
                            <DropdownMenuItem
                              onClick={() => onEdit(consumo)}
                              className="gap-1.5 cursor-pointer text-xs"
                            >
                              <Edit className="size-3 text-amber-500" />
                              <span>Editar Borrador</span>
                            </DropdownMenuItem>
                          )}

                          {isBorrador && onConfirm && (
                            <DropdownMenuItem
                              onClick={() => onConfirm(consumo)}
                              className="gap-1.5 text-emerald-600 focus:text-emerald-600 cursor-pointer text-xs"
                            >
                              <CheckCircle2 className="size-3 text-emerald-500" />
                              <span>Confirmar Despacho</span>
                            </DropdownMenuItem>
                          )}

                          {isConfirmado && onAnular && (
                            <DropdownMenuItem
                              onClick={() => onAnular(consumo)}
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
                                onClick={() => onDelete(consumo)}
                                className="gap-1.5 text-destructive focus:text-destructive cursor-pointer text-xs"
                              >
                                <Trash2 className="size-3" />
                                <span>Eliminar Borrador</span>
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onViewAudit?.(consumo)}
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
