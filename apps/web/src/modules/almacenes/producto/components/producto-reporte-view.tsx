"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Filter,
  RefreshCw,
  Search,
  X,
  Package,
  Boxes,
  Tag,
  Building2,
  Scale,
  Calendar,
  Layers,
  ArrowLeft,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

import { useProductos, useExportarProductosExcel } from "../hooks/use-producto";
import { useCategoriasProducto } from "../../categoria-producto/hooks/use-categoria-producto";
import { useMarcas } from "../../marca/hooks/use-marca";
import { useProveedores } from "@/modules/compras/proveedor/hooks/use-proveedor";
import { useUnidadesMedida } from "@/modules/parametros/unidad-medida/hooks/use-unidades-medida";
import type { ExportarProductosQueryParams } from "../types/producto.types";
import { ROUTES } from "@/config/routes";

export function ProductoReporteView() {
  // ---------------------------------------------------------------------------
  // Filters State
  // ---------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [categoriaId, setCategoriaId] = React.useState<number | null>(null);
  const [marcaId, setMarcaId] = React.useState<number | null>(null);
  const [proveedorId, setProveedorId] = React.useState<number | null>(null);
  const [catalogoUm, setCatalogoUm] = React.useState<string | null>(null);
  const [unidadMedidaId, setUnidadMedidaId] = React.useState<number | null>(null);
  const [controlaLote, setControlaLote] = React.useState<string>("TODOS");
  const [controlaVence, setControlaVence] = React.useState<string>("TODOS");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);

  // ---------------------------------------------------------------------------
  // Selectors Data
  // ---------------------------------------------------------------------------
  const { data: categoriasData } = useCategoriasProducto({ pageSize: 500 });
  const { data: marcasData } = useMarcas({ pageSize: 500 });
  const { data: proveedoresData } = useProveedores({ pageSize: 500 });
  const { data: unidadesMedidaData } = useUnidadesMedida({ pageSize: 500 });

  const categorias = React.useMemo(() => categoriasData?.items ?? [], [categoriasData]);
  const marcas = React.useMemo(() => marcasData?.items ?? [], [marcasData]);
  const proveedores = React.useMemo(() => proveedoresData?.items ?? [], [proveedoresData]);
  const unidadesMedida = React.useMemo(() => unidadesMedidaData?.items ?? [], [unidadesMedidaData]);

  // Extraer grupos/catálogos únicos de Unidades de Medida
  const catalogosUnidadMedida = React.useMemo(() => {
    const categoriesSet = new Set<string>();
    unidadesMedida.forEach((um) => {
      if (um.categoria && um.categoria.trim().length > 0) {
        categoriesSet.add(um.categoria.trim());
      }
    });
    return Array.from(categoriesSet).sort();
  }, [unidadesMedida]);

  // Unidades de medida filtradas por el catálogo seleccionado (si aplica)
  const unidadesMedidaFiltradas = React.useMemo(() => {
    if (!catalogoUm) return unidadesMedida;
    return unidadesMedida.filter((um) => um.categoria === catalogoUm);
  }, [unidadesMedida, catalogoUm]);

  // ---------------------------------------------------------------------------
  // Query Params & Data Fetching
  // ---------------------------------------------------------------------------
  const parsedControlaLote = React.useMemo(() => {
    if (controlaLote === "SI") return true;
    if (controlaLote === "NO") return false;
    return undefined;
  }, [controlaLote]);

  const parsedControlaVence = React.useMemo(() => {
    if (controlaVence === "SI") return true;
    if (controlaVence === "NO") return false;
    return undefined;
  }, [controlaVence]);

  const queryParams = React.useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch.trim() || undefined,
      categoriaProductoId: categoriaId ?? undefined,
      marcaId: marcaId ?? undefined,
      proveedorId: proveedorId ?? undefined,
      unidadMedidaId: unidadMedidaId ?? undefined,
      categoriaUnidadMedida: catalogoUm ?? undefined,
      controlaLote: parsedControlaLote,
      controlaVencimiento: parsedControlaVence,
    }),
    [
      page,
      pageSize,
      debouncedSearch,
      categoriaId,
      marcaId,
      proveedorId,
      unidadMedidaId,
      catalogoUm,
      parsedControlaLote,
      parsedControlaVence,
    ]
  );

  const {
    data: productosData,
    isLoading,
    isFetching,
    refetch,
  } = useProductos(queryParams);

  const exportMutation = useExportarProductosExcel();

  const totalItems = productosData?.totalItems ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const items = productosData?.items ?? [];

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoriaId(null);
    setMarcaId(null);
    setProveedorId(null);
    setCatalogoUm(null);
    setUnidadMedidaId(null);
    setControlaLote("TODOS");
    setControlaVence("TODOS");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      categoriaId !== null ||
      marcaId !== null ||
      proveedorId !== null ||
      catalogoUm !== null ||
      unidadMedidaId !== null ||
      controlaLote !== "TODOS" ||
      controlaVence !== "TODOS"
  );

  const handleExportExcel = async () => {
    try {
      const exportParams: ExportarProductosQueryParams = {
        search: debouncedSearch.trim() || undefined,
        categoriaProductoId: categoriaId ?? undefined,
        marcaId: marcaId ?? undefined,
        proveedorId: proveedorId ?? undefined,
        unidadMedidaId: unidadMedidaId ?? undefined,
        categoriaUnidadMedida: catalogoUm ?? undefined,
        controlaLote: parsedControlaLote,
        controlaVencimiento: parsedControlaVence,
      };

      const blob = await exportMutation.mutateAsync(exportParams);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T]/g, "")
        .slice(0, 14);
      link.download = `Reporte_Productos_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Reporte Excel generado y descargado con éxito.");
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al generar el reporte Excel.");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full pb-10">
      {/* ========================================================================= */}
      {/* 1. Header & Quick Actions */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.ALMACENES.PRODUCTOS}>
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-lg"
            >
              <ArrowLeft className="size-4" />
            </Button>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="size-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Reporte General de Productos
              </h1>
              <Badge
                variant="secondary"
                className="text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
              >
                {totalItems} {totalItems === 1 ? "producto" : "productos"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generación de informes parametrizados con Catálogo U.M., Categoría, Marca y Proveedor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Button
            onClick={handleExportExcel}
            disabled={exportMutation.isPending || isFetching}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 shadow-sm"
          >
            <Download className="size-4" />
            {exportMutation.isPending ? "Generando Excel..." : "Exportar a Excel (.xlsx)"}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Filtros Avanzados Card */}
      {/* ========================================================================= */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Criterios de Filtrado</span>
              {hasActiveFilters && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-600">
                  Filtros activos
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1 px-2"
              >
                <X className="size-3.5" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Buscador de texto */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Search className="size-3 text-muted-foreground" />
                Búsqueda Rápida
              </Label>
              <div className="relative">
                <Input
                  placeholder="Código, nombre, descripción..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="h-8.5 text-xs pr-7"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setPage(1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categoría de Producto */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3 text-muted-foreground" />
                Categoría de Producto
              </Label>
              <Select
                value={categoriaId ? String(categoriaId) : "ALL"}
                onValueChange={(val) => {
                  setCategoriaId(val === "ALL" ? null : Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="ALL">Todas las categorías</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Marca */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="size-3 text-muted-foreground" />
                Marca
              </Label>
              <Select
                value={marcaId ? String(marcaId) : "ALL"}
                onValueChange={(val) => {
                  setMarcaId(val === "ALL" ? null : Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue placeholder="Todas las marcas" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="ALL">Todas las marcas</SelectItem>
                  {marcas.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Proveedor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-3 text-muted-foreground" />
                Proveedor
              </Label>
              <Select
                value={proveedorId ? String(proveedorId) : "ALL"}
                onValueChange={(val) => {
                  setProveedorId(val === "ALL" ? null : Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue placeholder="Todos los proveedores" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="ALL">Todos los proveedores</SelectItem>
                  {proveedores.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.razonSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Catálogo / Grupo de Unidad de Medida */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Boxes className="size-3 text-muted-foreground" />
                Catálogo / Grupo U.M.
              </Label>
              <Select
                value={catalogoUm ?? "ALL"}
                onValueChange={(val) => {
                  const newCat = val === "ALL" ? null : val;
                  setCatalogoUm(newCat);
                  setUnidadMedidaId(null);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue placeholder="Todos los catálogos" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="ALL">Todos los grupos / catálogos</SelectItem>
                  {catalogosUnidadMedida.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unidad de Medida */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Scale className="size-3 text-muted-foreground" />
                Unidad de Medida
              </Label>
              <Select
                value={unidadMedidaId ? String(unidadMedidaId) : "ALL"}
                onValueChange={(val) => {
                  setUnidadMedidaId(val === "ALL" ? null : Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue placeholder="Todas las unidades" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="ALL">Todas las unidades</SelectItem>
                  {unidadesMedidaFiltradas.map((um) => (
                    <SelectItem key={um.id} value={String(um.id)}>
                      {um.nombre} {um.simbolo ? `(${um.simbolo})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Controla Lote */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Control de Lote
              </Label>
              <Select
                value={controlaLote}
                onValueChange={(val) => {
                  setControlaLote(val ?? "TODOS");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="SI">Solo con control de lote</SelectItem>
                  <SelectItem value="NO">Sin control de lote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Controla Vencimiento */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Control de Vencimiento
              </Label>
              <Select
                value={controlaVence}
                onValueChange={(val) => {
                  setControlaVence(val ?? "TODOS");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="SI">Solo con vencimiento</SelectItem>
                  <SelectItem value="NO">Sin vencimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 3. Tabla de Vista Previa del Reporte */}
      {/* ========================================================================= */}
      <Card className="border-border/60 shadow-xs overflow-hidden">
        <div className="p-3 bg-muted/10 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              Vista previa de datos
            </span>
            <span className="text-xs text-muted-foreground">
              (Mostrando {items.length} de {totalItems} registros)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filas por página:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-24 text-xs font-semibold">Código</TableHead>
                <TableHead className="min-w-[200px] text-xs font-semibold">Producto</TableHead>
                <TableHead className="text-xs font-semibold">Categoría</TableHead>
                <TableHead className="text-xs font-semibold">Marca</TableHead>
                <TableHead className="text-xs font-semibold">Catálogo U.M.</TableHead>
                <TableHead className="text-xs font-semibold">Unidad Medida</TableHead>
                <TableHead className="text-xs font-semibold">Proveedor</TableHead>
                <TableHead className="text-center text-xs font-semibold">Lote / Vence</TableHead>
                <TableHead className="text-right text-xs font-semibold">Stock Mín.</TableHead>
                <TableHead className="text-right text-xs font-semibold">Stock Máx.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="p-3 rounded-full bg-muted/40 text-muted-foreground/60">
                        <Search className="size-6" />
                      </div>
                      <p className="text-sm font-medium">No se encontraron productos</p>
                      <p className="text-xs text-muted-foreground/80 max-w-sm">
                        No hay productos que coincidan con los filtros seleccionados. Intenta ajustar los criterios de búsqueda.
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearFilters}
                          className="mt-2 h-8 text-xs"
                        >
                          Restablecer todos los filtros
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((prod) => (
                  <TableRow key={prod.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {prod.codigo}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">
                          {prod.nombre}
                        </span>
                        {prod.descripcion && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1">
                            {prod.descripcion}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-normal py-0">
                        {prod.categoriaProductoNombre || "Sin categoría"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {prod.marcaNombre ? (
                        <span className="font-medium text-foreground">{prod.marcaNombre}</span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {prod.unidadMedidaCategoria ? (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 py-0"
                        >
                          {prod.unidadMedidaCategoria}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-medium">{prod.unidadMedidaNombre}</span>{" "}
                      {prod.unidadMedidaSimbolo && (
                        <span className="text-muted-foreground font-mono text-[11px]">
                          ({prod.unidadMedidaSimbolo})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {prod.proveedorRazonSocial ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground line-clamp-1">
                            {prod.proveedorRazonSocial}
                          </span>
                          {prod.proveedorCodigo && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {prod.proveedorCodigo}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {prod.controlaLote && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                          >
                            Lote
                          </Badge>
                        )}
                        {prod.controlaVencimiento && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                          >
                            Vence
                          </Badge>
                        )}
                        {!prod.controlaLote && !prod.controlaVencimiento && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {Number(prod.stockMinimo).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {prod.stockMaximo !== null && prod.stockMaximo !== undefined
                        ? Number(prod.stockMaximo).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-3 bg-muted/10 border-t border-border/40 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Página <span className="font-medium text-foreground">{page}</span> de{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                className="h-7 px-2 text-xs gap-1"
              >
                <ChevronLeft className="size-3.5" />
                Anterior
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isFetching}
                className="h-7 px-2 text-xs gap-1"
              >
                Siguiente
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
