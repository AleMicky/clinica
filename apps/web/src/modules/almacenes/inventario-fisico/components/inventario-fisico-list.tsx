"use client";

import * as React from "react";
import {
  ClipboardCheck,
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
  PlayCircle,
  Calculator,
  Lock,
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
  EstadoInventarioFisico,
  type InventarioFisicoResponse,
} from "../types/inventario-fisico.types";
import { AlmacenAutocomplete } from "../../almacen";

interface InventarioFisicoListProps {
  inventarios: InventarioFisicoResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  selectedAlmacenId?: number | null;
  selectedEstado?: EstadoInventarioFisico | null;
  onSearchChange?: (value: string) => void;
  onAlmacenChange?: (almacenId: number | null) => void;
  onEstadoChange?: (estado: EstadoInventarioFisico | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddInventario?: () => void;
  onViewDetail?: (inventario: InventarioFisicoResponse) => void;
  onEdit?: (inventario: InventarioFisicoResponse) => void;
  onIniciarConteo?: (inventario: InventarioFisicoResponse) => void;
  onRegistrarConteo?: (inventario: InventarioFisicoResponse) => void;
  onCerrar?: (inventario: InventarioFisicoResponse) => void;
  onAnular?: (inventario: InventarioFisicoResponse) => void;
  onDelete?: (inventario: InventarioFisicoResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (inventario: InventarioFisicoResponse) => void;
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

export function getEstadoInventarioBadge(estado: EstadoInventarioFisico) {
  switch (estado) {
    case EstadoInventarioFisico.Borrador:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 gap-1"
        >
          <Clock className="size-2.5" />
          Borrador
        </Badge>
      );
    case EstadoInventarioFisico.EnConteo:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 gap-1"
        >
          <PlayCircle className="size-2.5" />
          En Conteo
        </Badge>
      );
    case EstadoInventarioFisico.Cerrado:
      return (
        <Badge
          variant="outline"
          className="text-[9px] h-4.5 px-1.5 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 gap-1"
        >
          <CheckCircle2 className="size-2.5" />
          Cerrado / Ajustado
        </Badge>
      );
    case EstadoInventarioFisico.Anulado:
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

export function InventarioFisicoList({
  inventarios,
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
  onAddInventario,
  onViewDetail,
  onEdit,
  onIniciarConteo,
  onRegistrarConteo,
  onCerrar,
  onAnular,
  onDelete,
  onRefresh,
  onViewAudit,
}: InventarioFisicoListProps) {
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
      onEstadoChange?.(EstadoInventarioFisico.Borrador);
    else if (val === "en-conteo")
      onEstadoChange?.(EstadoInventarioFisico.EnConteo);
    else if (val === "cerrado")
      onEstadoChange?.(EstadoInventarioFisico.Cerrado);
    else if (val === "anulado")
      onEstadoChange?.(EstadoInventarioFisico.Anulado);
  };

  const currentTab =
    selectedEstado === null
      ? "all"
      : selectedEstado === EstadoInventarioFisico.Borrador
      ? "borrador"
      : selectedEstado === EstadoInventarioFisico.EnConteo
      ? "en-conteo"
      : selectedEstado === EstadoInventarioFisico.Cerrado
      ? "cerrado"
      : "anulado";

  const handleExportCsv = () => {
    if (!inventarios || inventarios.length === 0) return;
    const headers = [
      "ID",
      "Número",
      "Almacén",
      "Fecha Inicio",
      "Fecha Cierre",
      "Estado",
      "Cant. Productos",
      "Observación",
    ];
    const rows = inventarios.map((i) => [
      i.id,
      `"${i.numero.replace(/"/g, '""')}"`,
      `"${(i.almacenNombre || "").replace(/"/g, '""')}"`,
      `"${i.fechaInicio}"`,
      `"${i.fechaCierre || ""}"`,
      i.estado === EstadoInventarioFisico.Borrador
        ? "Borrador"
        : i.estado === EstadoInventarioFisico.EnConteo
        ? "En Conteo"
        : i.estado === EstadoInventarioFisico.Cerrado
        ? "Cerrado"
        : "Anulado",
      (i.detalles || []).length,
      `"${(i.observacion || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `inventarios_fisicos_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedAlmacenId !== null ||
    selectedEstado !== null;

  return (
    <div className="flex flex-col gap-2.5 bg-card border border-border/60 rounded-lg p-3 shadow-2xs">
      {/* Top Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-2 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <ClipboardCheck className="size-3.5 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Listado de Inventarios
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
                value="en-conteo"
                className="text-[10px] h-5.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1"
              >
                <PlayCircle className="size-2 text-blue-500" />
                En Conteo
              </TabsTrigger>
              <TabsTrigger
                value="cerrado"
                className="text-[10px] h-5.5 px-2 data-[state=active]:bg-background data-[state=active]:shadow-xs gap-1"
              >
                <CheckCircle2 className="size-2 text-emerald-500" />
                Cerrados
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
            disabled={isLoading || inventarios.length === 0}
            className="h-6.5 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Download className="size-2.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>

          {onAddInventario && (
            <Button
              size="sm"
              onClick={onAddInventario}
              className="h-6.5 px-2.5 text-[11px] bg-primary hover:bg-primary/90 text-primary-foreground gap-1 shadow-2xs cursor-pointer font-medium"
            >
              <Plus className="size-2.5" />
              <span>Nuevo Inventario</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
        {/* Search */}
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

        {/* Almacen Autocomplete */}
        <div className="w-full">
          <AlmacenAutocomplete
            value={selectedAlmacenId}
            onValueChange={(val) => onAlmacenChange?.(val)}
            placeholder="Filtrar por almacén..."
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
                onAlmacenChange?.(null);
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
              <th className="px-2.5 py-2 w-32">Fecha Inicio</th>
              <th className="px-2.5 py-2 w-32">Fecha Cierre</th>
              <th className="px-2.5 py-2 w-28">Estado</th>
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
                    <Skeleton className="h-3.5 w-32" />
                  </td>
                  <td className="px-2.5 py-2">
                    <Skeleton className="h-3.5 w-20" />
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
            ) : inventarios.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Inbox className="size-4" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      No se encontraron inventarios físicos
                    </p>
                    <p className="text-[10px] text-muted-foreground max-w-xs">
                      {hasActiveFilters
                        ? "Intenta modificar los filtros de búsqueda o restablecerlos."
                        : "Comienza programando tu primer inventario físico o arqueo de stock."}
                    </p>
                    {onAddInventario && (
                      <Button
                        size="sm"
                        onClick={onAddInventario}
                        className="mt-1 h-6.5 text-[11px] bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                      >
                        <Plus className="size-2.5" />
                        <span>Nuevo Inventario</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              inventarios.map((inv) => {
                const isBorrador = inv.estado === EstadoInventarioFisico.Borrador;
                const isEnConteo = inv.estado === EstadoInventarioFisico.EnConteo;
                const isCerrado = inv.estado === EstadoInventarioFisico.Cerrado;
                const isAnulado = inv.estado === EstadoInventarioFisico.Anulado;

                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => onViewDetail?.(inv)}
                  >
                    <td className="px-2.5 py-1.5">
                      <span className="font-mono font-bold text-foreground text-xs">
                        {inv.numero}
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Warehouse className="size-3 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{inv.almacenNombre || "-"}</span>
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5 text-muted-foreground font-mono text-[10px]">
                      {formatDate(inv.fechaInicio)}
                    </td>
                    <td className="px-2.5 py-1.5 text-muted-foreground font-mono text-[10px]">
                      {formatDate(inv.fechaCierre)}
                    </td>
                    <td className="px-2.5 py-1.5">
                      {getEstadoInventarioBadge(inv.estado)}
                    </td>
                    <td className="px-2.5 py-1.5 text-center font-mono text-xs text-muted-foreground">
                      {(inv.detalles || []).length}
                    </td>
                    <td
                      className="px-2.5 py-1.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                          aria-label={`Acciones de ${inv.numero}`}
                        >
                          <MoreVertical className="size-3" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 text-xs">
                          <DropdownMenuItem
                            onClick={() => onViewDetail?.(inv)}
                            className="gap-1.5 cursor-pointer text-xs"
                          >
                            <Eye className="size-3 text-blue-500" />
                            <span>Ver Arqueo / Detalle</span>
                          </DropdownMenuItem>

                          {isBorrador && onEdit && (
                            <DropdownMenuItem
                              onClick={() => onEdit(inv)}
                              className="gap-1.5 cursor-pointer text-xs"
                            >
                              <Edit className="size-3 text-amber-500" />
                              <span>Editar Borrador</span>
                            </DropdownMenuItem>
                          )}

                          {isBorrador && onIniciarConteo && (
                            <DropdownMenuItem
                              onClick={() => onIniciarConteo(inv)}
                              className="gap-1.5 text-blue-600 focus:text-blue-600 cursor-pointer text-xs"
                            >
                              <PlayCircle className="size-3 text-blue-500" />
                              <span>Iniciar Conteo Físico</span>
                            </DropdownMenuItem>
                          )}

                          {isEnConteo && onRegistrarConteo && (
                            <DropdownMenuItem
                              onClick={() => onRegistrarConteo(inv)}
                              className="gap-1.5 text-indigo-600 focus:text-indigo-600 cursor-pointer text-xs"
                            >
                              <Calculator className="size-3 text-indigo-500" />
                              <span>Registrar Conteos</span>
                            </DropdownMenuItem>
                          )}

                          {isEnConteo && onCerrar && (
                            <DropdownMenuItem
                              onClick={() => onCerrar(inv)}
                              className="gap-1.5 text-emerald-600 focus:text-emerald-600 cursor-pointer text-xs"
                            >
                              <Lock className="size-3 text-emerald-500" />
                              <span>Cerrar y Ajustar Stock</span>
                            </DropdownMenuItem>
                          )}

                          {!isCerrado && !isAnulado && onAnular && (
                            <DropdownMenuItem
                              onClick={() => onAnular(inv)}
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
                                onClick={() => onDelete(inv)}
                                className="gap-1.5 text-destructive focus:text-destructive cursor-pointer text-xs"
                              >
                                <Trash2 className="size-3" />
                                <span>Eliminar Borrador</span>
                              </DropdownMenuItem>
                            </>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onViewAudit?.(inv)}
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
