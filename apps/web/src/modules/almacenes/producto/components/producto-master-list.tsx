"use client";

import * as React from "react";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Layers,
  CalendarClock,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Filter,
  X,
  Loader2,
  RotateCcw,
  FileSpreadsheet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ProductoResponse } from "../types/producto.types";
import type { CategoriaProductoResponse } from "../../categoria-producto/types/categoria-producto.types";

interface ProductoMasterListProps {
  productos: ProductoResponse[];
  categorias: CategoriaProductoResponse[];
  isLoading: boolean;
  isFetching?: boolean;
  selectedProductoId: number | null;
  onSelectProducto: (producto: ProductoResponse) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  categoriaFilter: number | null;
  onCategoriaFilterChange: (catId: number | null) => void;
  onClearFilters?: () => void;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onAddProducto: () => void;
  onImportClick?: () => void;
  onEdit: (producto: ProductoResponse) => void;
  onDelete: (producto: ProductoResponse) => void;
  onRefresh: () => void;
}

export function ProductoMasterList({
  productos,
  categorias,
  isLoading,
  isFetching = false,
  selectedProductoId,
  onSelectProducto,
  searchTerm,
  onSearchChange,
  categoriaFilter,
  onCategoriaFilterChange,
  onClearFilters,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onAddProducto,
  onImportClick,
  onEdit,
  onDelete,
  onRefresh,
}: ProductoMasterListProps) {
  const hasActiveFilters = Boolean(searchTerm.trim() || categoriaFilter !== null);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const fromItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const toItem = Math.min(totalItems, page * pageSize);

  // Keyboard navigation through items
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (productos.length === 0) return;

    const currentIndex = productos.findIndex((p) => p.id === selectedProductoId);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = currentIndex < productos.length - 1 ? currentIndex + 1 : 0;
      onSelectProducto(productos[nextIndex]);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : productos.length - 1;
      onSelectProducto(productos[prevIndex]);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-card rounded-xl border border-border/40 shadow-2xs overflow-hidden outline-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Catálogo de productos"
    >
      {/* Top Header */}
      <div className="p-3 border-b border-border/30 space-y-2 bg-card">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 border border-primary/20">
              <Boxes className="size-3.5" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Catálogo
              </h2>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono font-bold bg-muted text-muted-foreground">
                {totalItems}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onImportClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onImportClick}
                className="h-7 px-2 text-xs font-medium gap-1 text-primary border-primary/25 hover:bg-primary/10 cursor-pointer rounded-lg shadow-2xs"
                title="Importar productos desde Excel"
              >
                <FileSpreadsheet className="size-3.5" />
                <span className="hidden sm:inline">Importar</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={onAddProducto}
              className="h-7 px-2.5 text-xs font-medium gap-1 cursor-pointer rounded-lg shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Nuevo</span>
            </Button>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-1.5">
          <div className="relative w-full">
            {isFetching ? (
              <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-primary animate-spin" />
            ) : (
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            )}
            <Input
              placeholder="Buscar por código o nombre..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-8 h-8 text-xs bg-muted/25 border-border/40 focus:bg-background rounded-lg w-full"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-sm transition-colors cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Select
              value={categoriaFilter !== null ? String(categoriaFilter) : "all"}
              onValueChange={(val) =>
                onCategoriaFilterChange(val === "all" ? null : Number(val))
              }
            >
              <SelectTrigger className="h-7.5 w-full text-xs bg-muted/20 border-border/40 text-muted-foreground focus:text-foreground rounded-lg">
                <div className="flex items-center gap-1.5 truncate">
                  <Filter className="size-3 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Todas las categorías" />
                </div>
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.codigo} — {cat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && onClearFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearFilters}
                className="size-7.5 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer rounded-lg"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="size-3.5" />
              </Button>
            )}

            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isLoading}
                className="size-7.5 shrink-0 border-border/40 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg bg-card"
                title="Recargar catálogo"
              >
                <RefreshCw className={cn("size-3.5", (isLoading || isFetching) && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 min-h-[380px] max-h-[calc(100vh-320px)]">
        {isLoading ? (
          <div className="space-y-1.5 p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-border/30 bg-card/60 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-16 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
                <Skeleton className="h-3 w-3/4 rounded" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-2.5 w-20 rounded" />
                  <Skeleton className="h-2.5 w-12 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/40 rounded-xl bg-card/40 my-3">
            <Boxes className="size-7 text-muted-foreground/40 stroke-1 mb-2" />
            <p className="text-xs font-semibold text-foreground">
              No se encontraron productos
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
              {hasActiveFilters
                ? "Sin coincidencias para los filtros aplicados."
                : "No hay productos registrados en el sistema."}
            </p>
            {hasActiveFilters && onClearFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="mt-3 h-7 text-xs gap-1.5 border-border/50 hover:bg-muted cursor-pointer rounded-lg"
              >
                <RotateCcw className="size-3" />
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          productos.map((prod) => {
            const isSelected = prod.id === selectedProductoId;

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProducto(prod)}
                className={cn(
                  "group relative flex flex-col gap-1 p-2.5 rounded-lg border transition-all duration-150 cursor-pointer text-left select-none",
                  isSelected
                    ? "bg-primary/[0.08] border-primary/40 shadow-2xs ring-1 ring-primary/20 border-l-[3px] border-l-primary"
                    : "bg-card/70 border-border/30 hover:bg-muted/40 hover:border-border/60"
                )}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span
                      className={cn(
                        "font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 tracking-tight",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "bg-muted text-muted-foreground group-hover:text-foreground border border-border/40"
                      )}
                    >
                      {prod.codigo}
                    </span>
                    <h4
                      className={cn(
                        "font-medium text-xs truncate",
                        isSelected ? "text-primary font-semibold" : "text-foreground"
                      )}
                    >
                      {prod.nombre}
                    </h4>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                      >
                        <MoreHorizontal className="size-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 text-xs">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(prod);
                          }}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <Edit2 className="size-3.5 text-muted-foreground" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(prod);
                          }}
                          className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Sub details: Category & Feature Badges */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground gap-2 pt-0.5">
                  <span className="truncate text-[10px] text-muted-foreground/90">
                    {prod.categoriaProductoNombre || "Sin categoría"}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {prod.controlaLote && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                        <Layers className="size-2.5" /> Lote
                      </span>
                    )}
                    {prod.controlaVencimiento && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                        <CalendarClock className="size-2.5" /> Vence
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modern Compact Sidebar Pagination */}
      <div className="px-3 py-2 border-t border-border/30 bg-muted/15 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{totalItems === 0 ? "0" : `${fromItem}-${toItem}`} de {totalItems}</span>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-6 w-14 text-[10px] bg-background border-border/40 px-1.5 py-0 font-medium">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size} / pág
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-0.5">
            <Button
              variant="outline"
              size="icon"
              className="size-6 cursor-pointer border-border/40 bg-background hover:bg-muted"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
              title="Página anterior"
            >
              <ChevronLeft className="size-3" />
            </Button>
            <span className="text-[10px] text-muted-foreground px-1 font-mono font-medium">
              {page}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-6 cursor-pointer border-border/40 bg-background hover:bg-muted"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isLoading}
              title="Página siguiente"
            >
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

