"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Inbox,
  Stethoscope,
} from "lucide-react";
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

export interface EspecialidadItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

interface EspecialidadTableProps {
  especialidades: EspecialidadItem[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (especialidad: EspecialidadItem) => void;
  onDelete?: (id: number) => void;
  onRefresh?: () => void;
}

export function EspecialidadTable({
  especialidades,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onRefresh,
}: EspecialidadTableProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Toolbar Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 items-center gap-2">
          <SearchInput
            placeholder="Buscar por código o especialidad..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full sm:w-72 h-8 text-xs"
          />
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

      {/* Bordered Table Container */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent h-9 border-b">
              <TableHead className="pl-4 text-xs font-semibold text-muted-foreground">Código</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Nombre / Especialidad</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Descripción</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Estado</TableHead>
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
                    <Skeleton className="h-4 w-40 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-56 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right pr-4 py-2">
                    <Skeleton className="h-7 w-7 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : especialidades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs py-8">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Inbox className="size-8 text-muted-foreground/50 stroke-1" />
                    <p className="font-medium text-foreground text-sm">No se encontraron especialidades</p>
                    <p className="text-xs text-muted-foreground">
                      No hay especialidades registradas o coincidentes con la búsqueda.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              especialidades.map((esp) => (
                <TableRow key={esp.id} className="hover:bg-muted/30 transition-colors h-10">
                  <TableCell className="pl-4 py-2 font-mono text-xs font-semibold text-primary">
                    <span className="bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
                      {esp.codigo}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 font-medium text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{esp.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground max-w-xs truncate">
                    {esp.descripcion || "—"}
                  </TableCell>
                  <TableCell className="py-2">
                    <StatusBadge active={esp.activo} />
                  </TableCell>
                  <TableCell className="text-right pr-4 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 text-xs">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onEdit?.(esp)}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Edit className="size-3.5" /> Editar Especialidad
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(esp.id)}
                          className="gap-2 text-destructive cursor-pointer text-xs"
                        >
                          <Trash2 className="size-3.5" /> Eliminar Especialidad
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
          itemLabel="especialidades"
        />
      </div>
    </div>
  );
}
