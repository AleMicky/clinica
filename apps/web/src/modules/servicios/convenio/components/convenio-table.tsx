"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Inbox,
  Calendar,
  Handshake,
  Tag,
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
import { DataTablePagination, SearchInput } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { ConvenioItem } from "../types/convenio.types";

interface ConvenioTableProps {
  convenios: ConvenioItem[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (convenio: ConvenioItem) => void;
  onManageTarifarios?: (convenio: ConvenioItem) => void;
  onDelete?: (convenio: ConvenioItem) => void;
  onRefresh?: () => void;
}

export function ConvenioTable({
  convenios,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onManageTarifarios,
  onDelete,
  onRefresh,
}: ConvenioTableProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput
            placeholder="Buscar por código, nombre o descripción..."
            value={searchTerm}
            onChange={onSearchChange}
            className="w-full sm:w-80 h-8 text-xs"
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

      {/* Table Container */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent h-9 border-b">
              <TableHead className="pl-4 text-xs font-semibold text-muted-foreground">Código</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Nombre del Convenio</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Vigencia</TableHead>
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
                    <Skeleton className="h-4 w-40 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-32 rounded" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-48 rounded" />
                  </TableCell>
                  <TableCell className="text-right pr-4 py-2">
                    <Skeleton className="h-7 w-7 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : convenios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs py-8">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Inbox className="size-8 text-muted-foreground/50 stroke-1" />
                    <p className="font-medium text-foreground text-sm">No se encontraron convenios</p>
                    <p className="text-xs text-muted-foreground">
                      No hay datos coincidentes con la búsqueda seleccionada.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              convenios.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/30 transition-colors h-10">
                  <TableCell className="pl-4 py-2 font-mono text-xs font-semibold text-primary">
                    <span className="bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
                      {c.codigo}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 font-medium text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <Handshake className="size-3.5 text-primary" />
                      <span>{c.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3 text-muted-foreground" />
                      <span>{c.fechaInicio}</span>
                      <span>-</span>
                      <span>{c.fechaFin || "Indefinido"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground truncate max-w-xs">
                    {c.descripcion || "Sin descripción"}
                  </TableCell>
                  <TableCell className="text-right pr-4 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onManageTarifarios?.(c)}
                            className="gap-2 cursor-pointer text-xs font-medium text-primary"
                          >
                            <Tag className="size-3.5" /> Tarifarios Asignados
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEdit?.(c)}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Edit className="size-3.5" /> Editar Convenio
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(c)}
                          className="gap-2 text-destructive cursor-pointer text-xs"
                        >
                          <Trash2 className="size-3.5" /> Eliminar Convenio
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
          itemLabel="convenios"
        />
      </div>
    </div>
  );
}
