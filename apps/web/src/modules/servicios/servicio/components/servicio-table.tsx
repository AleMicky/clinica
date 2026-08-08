"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Inbox,
  Activity,
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
import { DataTablePagination, SearchInput } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { ServicioItem } from "../types/servicio.types";
import type { CategoriaServicioResponse } from "../../categoria-servicio";

interface ServicioTableProps {
  servicios: ServicioItem[];
  categorias: CategoriaServicioResponse[];
  selectedCategoriaId: number;
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onCategoriaChange?: (categoriaId: number) => void;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (servicio: ServicioItem) => void;
  onDelete?: (servicio: ServicioItem) => void;
  onRefresh?: () => void;
}

export function ServicioTable({
  servicios,
  categorias,
  selectedCategoriaId,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onCategoriaChange,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onRefresh,
}: ServicioTableProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Filters & Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput
            placeholder="Buscar por código o nombre del servicio..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full sm:w-72 h-8 text-xs"
          />

          {onCategoriaChange && (
            <div className="flex items-center gap-1 border rounded-md p-0.5 bg-muted/30 overflow-x-auto text-xs max-w-full">
              <Filter className="size-3 text-muted-foreground ml-1.5 shrink-0" />
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoriaChange(cat.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-sm font-medium transition-all text-xs whitespace-nowrap cursor-pointer",
                    selectedCategoriaId === cat.id
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  )}
                >
                  {cat.nombre}
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

      {/* Table Container */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent h-9 border-b">
              <TableHead className="pl-4 text-xs font-semibold text-muted-foreground">Código</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Nombre del Servicio</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Categoría</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Descripción</TableHead>
              <TableHead className="text-right pr-4 text-xs font-semibold text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="h-10">
                  <TableCell className="pl-4 py-2">
                    <Skeleton className="h-4 w-16 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-44 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-60 rounded" />
                  </TableCell>
                  <TableCell className="text-right pr-4 py-2">
                    <Skeleton className="h-7 w-7 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : servicios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs py-8">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Inbox className="size-8 text-muted-foreground/50 stroke-1" />
                    <p className="font-medium text-foreground text-sm">No se encontraron servicios</p>
                    <p className="text-xs text-muted-foreground">
                      No hay servicios registrados en esta categoría o con la búsqueda actual.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              servicios.map((srv) => (
                <TableRow key={srv.id} className="hover:bg-muted/30 transition-colors h-10">
                  <TableCell className="pl-4 py-2 font-mono text-xs font-semibold text-primary">
                    <span className="bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
                      {srv.codigo}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 font-medium text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <Activity className="size-3.5 text-primary/80" />
                      <span>{srv.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge variant="outline" className="text-xs font-normal border-primary/20 bg-primary/5 text-primary">
                      {srv.categoriaNombre || "Categoría"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground truncate max-w-xs">
                    {srv.descripcion || "Sin descripción"}
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
                            onClick={() => onEdit?.(srv)}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Edit className="size-3.5" /> Editar Servicio
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(srv)}
                          className="gap-2 text-destructive cursor-pointer text-xs"
                        >
                          <Trash2 className="size-3.5" /> Eliminar Servicio
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
          itemLabel="servicios"
        />
      </div>
    </div>
  );
}
