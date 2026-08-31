"use client";

import * as React from "react";
import {
  Boxes,
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
import { DataTablePagination } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { ProductoResponse } from "../types/producto.types";
import type { CategoriaProductoResponse } from "../../categoria-producto/types/categoria-producto.types";

interface ProductoMasterListProps {
  productos: ProductoResponse[];
  categorias: CategoriaProductoResponse[];
  isLoading: boolean;
  selectedProductoId: number | null;
  onSelectProducto: (producto: ProductoResponse) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  categoriaFilter: number | null;
  onCategoriaFilterChange: (catId: number | null) => void;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onAddProducto: () => void;
  onEdit: (producto: ProductoResponse) => void;
  onDelete: (producto: ProductoResponse) => void;
  onRefresh: () => void;
}

export function ProductoMasterList({
  productos,
  categorias,
  isLoading,
  selectedProductoId,
  onSelectProducto,
  searchTerm,
  onSearchChange,
  categoriaFilter,
  onCategoriaFilterChange,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onAddProducto,
  onEdit,
  onDelete,
  onRefresh,
}: ProductoMasterListProps) {
  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/60 shadow-2xs overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 border-b border-border/40 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <Boxes className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Catálogo
                </h2>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                  {totalItems}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Lista de productos registrados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="size-7 border-border/60 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Recargar catálogo"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            </Button>
            <Button
              size="sm"
              onClick={onAddProducto}
              className="h-7 px-2.5 text-xs font-medium gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Nuevo</span>
            </Button>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por código o nombre..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/20 border-border/60 focus:bg-background w-full"
            />
          </div>

          <Select
            value={categoriaFilter !== null ? String(categoriaFilter) : "all"}
            onValueChange={(val) =>
              onCategoriaFilterChange(val === "all" ? null : Number(val))
            }
          >
            <SelectTrigger className="h-8 w-full text-xs bg-muted/20 border-border/60 text-muted-foreground focus:text-foreground">
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
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[380px] max-h-[calc(100vh-320px)]">
        {isLoading ? (
          <div className="space-y-2 p-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/40 bg-card/60 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-3.5 w-12" />
                </div>
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border/60 rounded-lg bg-card/40 my-2">
            <Boxes className="size-8 text-muted-foreground/40 stroke-1 mb-2" />
            <p className="text-xs font-semibold text-foreground">
              No se encontraron productos
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
              {searchTerm || categoriaFilter !== null
                ? "Sin coincidencias para los filtros aplicados."
                : "No hay productos registrados en el sistema."}
            </p>
          </div>
        ) : (
          productos.map((prod) => {
            const isSelected = prod.id === selectedProductoId;

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProducto(prod)}
                className={cn(
                  "group relative flex flex-col gap-1.5 p-2.5 rounded-lg border transition-all duration-150 cursor-pointer text-left select-none",
                  isSelected
                    ? "bg-primary/10 border-primary shadow-2xs ring-1 ring-primary/20"
                    : "bg-card border-border/50 hover:bg-muted/40 hover:border-border/80"
                )}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span
                      className={cn(
                        "font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 tracking-tight",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {prod.codigo}
                    </span>
                    <h4
                      className={cn(
                        "font-semibold text-xs truncate",
                        isSelected ? "text-primary" : "text-foreground"
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
                        <MoreHorizontal className="size-3.5" />
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

                    {isSelected && (
                      <ChevronRight className="size-4 text-primary shrink-0" />
                    )}
                  </div>
                </div>

                {/* Sub details: Category, Medida & Badges */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground gap-2 pt-0.5">
                  <span className="truncate text-[11px]">
                    {prod.categoriaProductoNombre || "Sin categoría"}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {prod.controlaLote && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                      >
                        <Layers className="size-2 mr-0.5" /> Lote
                      </Badge>
                    )}
                    {prod.controlaVencimiento && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
                      >
                        <CalendarClock className="size-2 mr-0.5" /> Vence
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalItems > 10 && (
        <div className="p-2 border-t border-border/40 bg-muted/10">
          <DataTablePagination
            totalItems={totalItems}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            isLoading={isLoading}
            itemLabel="productos"
          />
        </div>
      )}
    </div>
  );
}
