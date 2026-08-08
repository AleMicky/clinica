"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Filter,
  Inbox,
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
import { StatusBadge, DataTablePagination, SearchInput } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { UnidadMedidaItem } from "../types/unidad-medida.types";

export type { UnidadMedidaItem };

interface UnidadMedidaTableProps {
  unidades: UnidadMedidaItem[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  categoriaFilter?: string;
  onSearchChange?: (value: string) => void;
  onCategoriaFilterChange?: (categoria: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (unidad: UnidadMedidaItem) => void;
  onDelete?: (unidad: UnidadMedidaItem) => void;
  onRefresh?: () => void;
}

const getCategoryBadge = (categoria: string) => {
  const catLower = categoria?.toLowerCase() ?? "";
  if (catLower.includes("dosificac")) {
    return (
      <Badge variant="outline" className="text-xs border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">
        {categoria}
      </Badge>
    );
  }
  if (catLower.includes("volumen")) {
    return (
      <Badge variant="outline" className="text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
        {categoria}
      </Badge>
    );
  }
  if (catLower.includes("peso")) {
    return (
      <Badge variant="outline" className="text-xs border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400 font-medium">
        {categoria}
      </Badge>
    );
  }
  if (catLower.includes("presentac")) {
    return (
      <Badge variant="outline" className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
        {categoria}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs font-medium">
      {categoria}
    </Badge>
  );
};

export function UnidadMedidaTable({
  unidades,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  categoriaFilter = "Todos",
  onSearchChange,
  onCategoriaFilterChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onRefresh,
}: UnidadMedidaTableProps) {
  const categorias = ["Todos", "Dosificación", "Peso", "Volumen", "Presentación"];

  return (
    <div className="space-y-3 w-full">
      {/* Compact Toolbar Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput
            placeholder="Buscar por código, nombre o símbolo..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full sm:w-72 h-8 text-xs"
          />

          {onCategoriaFilterChange && (
            <div className="flex items-center gap-1 border rounded-md p-0.5 bg-muted/30 overflow-x-auto text-xs">
              <Filter className="size-3 text-muted-foreground ml-1.5 shrink-0" />
              {categorias.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoriaFilterChange(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-sm font-medium transition-all text-xs whitespace-nowrap cursor-pointer",
                    categoriaFilter === cat
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  )}
                >
                  {cat}
                </button>
              ))}
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

      {/* Cardless Compact Bordered Table Container */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent h-9 border-b">
              <TableHead className="pl-4 text-xs font-semibold text-muted-foreground">Código</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Nombre Completo</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Símbolo</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Categoría</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Estado</TableHead>
              <TableHead className="text-right pr-4 text-xs font-semibold text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="h-10">
                  <TableCell className="pl-4 py-2">
                    <Skeleton className="h-4 w-14 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-36 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-10 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right pr-4 py-2">
                    <Skeleton className="h-7 w-7 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : unidades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-xs py-8">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Inbox className="size-8 text-muted-foreground/50 stroke-1" />
                    <p className="font-medium text-foreground text-sm">No se encontraron unidades</p>
                    <p className="text-xs text-muted-foreground">
                      No hay datos coincidentes con la búsqueda o filtro seleccionado.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              unidades.map((unidad) => (
                <TableRow key={unidad.id} className="hover:bg-muted/30 transition-colors h-10">
                  <TableCell className="pl-4 py-2 font-mono text-xs font-semibold text-primary">
                    <span className="bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
                      {unidad.codigo}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 font-medium text-xs text-foreground">
                    {unidad.nombre}
                  </TableCell>
                  <TableCell className="py-2 font-mono font-semibold text-xs text-muted-foreground">
                    {unidad.simbolo}
                  </TableCell>
                  <TableCell className="py-2">
                    {getCategoryBadge(unidad.categoria)}
                  </TableCell>
                  <TableCell className="py-2">
                    <StatusBadge active={unidad.activo} />
                  </TableCell>
                  <TableCell className="text-right pr-4 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 text-xs">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onEdit?.(unidad)}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Edit className="size-3.5" /> Editar Unidad
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(unidad)}
                          className="gap-2 text-destructive cursor-pointer text-xs"
                        >
                          <Trash2 className="size-3.5" /> Eliminar Unidad
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
          itemLabel="unidades"
        />
      </div>
    </div>
  );
}

