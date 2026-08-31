"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Inbox,
  History,
  Clock,
  Layers,
  CalendarClock,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination, SearchInput } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { ProductoResponse } from "../types/producto.types";
import type { CategoriaProductoResponse } from "../../categoria-producto/types/categoria-producto.types";

interface ProductoTableProps {
  productos: ProductoResponse[];
  categorias: CategoriaProductoResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  categoriaFilter?: number | null;
  onSearchChange?: (value: string) => void;
  onCategoriaFilterChange?: (categoriaId: number | null) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (producto: ProductoResponse) => void;
  onDelete?: (producto: ProductoResponse) => void;
  onViewAudit?: (producto: ProductoResponse) => void;
  onRefresh?: () => void;
}

export function ProductoTable({
  productos,
  categorias,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  categoriaFilter = null,
  onSearchChange,
  onCategoriaFilterChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onViewAudit,
  onRefresh,
}: ProductoTableProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Toolbar Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput
            placeholder="Buscar por código o nombre..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full sm:w-64 h-8 text-xs"
          />

          {onCategoriaFilterChange && (
            <div className="w-full sm:w-56">
              <Select
                value={categoriaFilter !== null ? String(categoriaFilter) : "all"}
                onValueChange={(val) =>
                  onCategoriaFilterChange(val === "all" ? null : Number(val))
                }
              >
                <SelectTrigger className="h-8 text-xs bg-card">
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
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              title="Recargar datos"
              className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent h-9 border-b">
              <TableHead className="pl-4 text-xs font-semibold text-muted-foreground">Código</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Producto / Descripción</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Categoría</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">U. Medida</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Control</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Stock Min / Max</TableHead>
              <TableHead className="text-right pr-4 text-xs font-semibold text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="h-12">
                  <TableCell className="pl-4 py-2">
                    <Skeleton className="h-4 w-16 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-44 rounded mb-1" />
                    <Skeleton className="h-3 w-28 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-16 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-5 w-20 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-20 rounded" />
                  </TableCell>
                  <TableCell className="text-right pr-4 py-2">
                    <Skeleton className="h-7 w-7 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : productos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-muted-foreground text-xs py-8">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Inbox className="size-8 text-muted-foreground/50 stroke-1" />
                    <p className="font-medium text-foreground text-sm">No se encontraron productos</p>
                    <p className="text-xs text-muted-foreground">
                      {searchTerm || categoriaFilter !== null
                        ? "No hay productos coincidentes con los filtros aplicados."
                        : "No hay productos registrados en el sistema."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              productos.map((producto) => (
                <TableRow key={producto.id} className="hover:bg-muted/30 transition-colors h-12">
                  {/* Código */}
                  <TableCell className="pl-4 py-2 font-mono text-xs font-semibold text-primary">
                    <span className="bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
                      {producto.codigo}
                    </span>
                  </TableCell>

                  {/* Nombre y Descripción */}
                  <TableCell className="py-2 min-w-[180px]">
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-foreground">
                        {producto.nombre}
                      </span>
                      {producto.descripcion ? (
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {producto.descripcion}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60 italic">
                          Sin descripción
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Categoría */}
                  <TableCell className="py-2">
                    <Badge
                      variant="outline"
                      className="text-xs font-medium bg-muted/40 border-border/70"
                    >
                      {producto.categoriaProductoNombre || "Sin categoría"}
                    </Badge>
                  </TableCell>

                  {/* Unidad de Medida */}
                  <TableCell className="py-2 text-xs font-medium text-foreground">
                    <div className="flex items-center gap-1">
                      <span>{producto.unidadMedidaNombre || "N/A"}</span>
                      {producto.unidadMedidaSimbolo && (
                        <span className="text-muted-foreground font-mono text-[11px]">
                          ({producto.unidadMedidaSimbolo})
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Controles de Lote y Vencimiento */}
                  <TableCell className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {producto.controlaLote && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 gap-1 font-medium"
                        >
                          <Layers className="size-2.5" /> Lote
                        </Badge>
                      )}
                      {producto.controlaVencimiento && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1 font-medium"
                        >
                          <CalendarClock className="size-2.5" /> Vence
                        </Badge>
                      )}
                      {!producto.controlaLote && !producto.controlaVencimiento && (
                        <span className="text-[11px] text-muted-foreground/70">Estándar</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Stock Min / Max */}
                  <TableCell className="py-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">
                        Min: {producto.stockMinimo}
                      </span>
                      <span className="text-muted-foreground/60">/</span>
                      <span className="text-muted-foreground">
                        Max: {producto.stockMaximo !== null && producto.stockMaximo !== undefined ? producto.stockMaximo : "—"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right pr-4 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">Acciones</DropdownMenuLabel>
                          {onViewAudit && (
                            <DropdownMenuItem
                              onClick={() => onViewAudit(producto)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <History className="size-3.5 text-muted-foreground" /> Ver Auditoría
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onEdit?.(producto)}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Edit className="size-3.5" /> Editar Producto
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(producto)}
                          className="gap-2 text-destructive cursor-pointer text-xs"
                        >
                          <Trash2 className="size-3.5" /> Eliminar Producto
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <DataTablePagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange || (() => {})}
          onPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
          itemLabel="productos"
        />
      </div>
    </div>
  );
}
