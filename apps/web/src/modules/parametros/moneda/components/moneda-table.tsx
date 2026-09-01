"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  RefreshCw,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  StatusBadge,
  DataTablePagination,
  DataTableToolbar,
  TableSkeletonRows,
  EmptyState,
} from "@/components/shared";
import { cn } from "@/lib/utils";

export interface MonedaItem {
  id: number | string;
  codigo: string;
  simbolo: string;
  nombre: string;
  decimales: number;
  esBase: boolean;
  activo: boolean;
}

interface MonedaTableProps {
  monedas: MonedaItem[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSetMonedaBase?: (id: number | string) => void;
  onEdit?: (moneda: MonedaItem) => void;
  onDelete?: (id: number | string) => void;
  onInactivate?: (id: number | string) => void;
  onRefresh?: () => void;
}

export function MonedaTable({
  monedas,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onSetMonedaBase,
  onEdit,
  onDelete,
  onInactivate,
  onRefresh,
}: MonedaTableProps) {
  const handleDeleteAction = onDelete ?? onInactivate;

  return (
    <div className="space-y-3 w-full">
      {/* Centralized Toolbar */}
      <DataTableToolbar
        searchValue={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder="Buscar por código ISO o nombre..."
        totalCount={totalItems}
        filteredCount={monedas.length}
        onRefresh={onRefresh}
        isRefreshing={isLoading}
      />

      {/* Cardless Compact Bordered Table Container */}
      <div className="rounded-lg border bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent h-9 border-b">
              <TableHead className="pl-4 text-xs font-semibold text-muted-foreground">Código ISO</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Símbolo</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Nombre de la Moneda</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Decimales</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Tipo de Moneda</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Estado</TableHead>
              <TableHead className="text-right pr-4 text-xs font-semibold text-muted-foreground">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows rows={5} columns={7} />
            ) : monedas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-4">
                  <EmptyState
                    title="No se encontraron monedas"
                    description="No hay divisas coincidentes con los criterios de búsqueda."
                  />
                </TableCell>
              </TableRow>
            ) : (
              monedas.map((moneda) => (
                <TableRow key={moneda.id} className="hover:bg-muted/30 transition-colors h-10">
                  <TableCell className="pl-4 py-2 font-mono text-xs font-semibold text-primary">
                    <span className="bg-primary/5 border border-primary/20 px-2 py-0.5 rounded">
                      {moneda.codigo}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 font-mono font-bold text-xs text-foreground">
                    {moneda.simbolo}
                  </TableCell>
                  <TableCell className="py-2 font-medium text-xs text-foreground">
                    {moneda.nombre}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">
                    {moneda.decimales} dec.
                  </TableCell>
                  <TableCell className="py-2">
                    {moneda.esBase ? (
                      <Badge variant="outline" className="gap-1 text-xs border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
                        <Star className="size-3 fill-current" /> Moneda Base
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                        Secundaria
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <StatusBadge active={moneda.activo} />
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
                            onClick={() => onEdit?.(moneda)}
                            className="gap-2 cursor-pointer text-xs"
                          >
                            <Edit className="size-3.5" /> Editar Moneda
                          </DropdownMenuItem>
                          {!moneda.esBase && (
                            <DropdownMenuItem
                              onClick={() => onSetMonedaBase?.(moneda.id)}
                              className="gap-2 cursor-pointer text-xs"
                            >
                              <Star className="size-3.5 text-amber-500" /> Establecer Moneda Base
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        {!moneda.esBase && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteAction?.(moneda.id)}
                            className="gap-2 text-destructive cursor-pointer text-xs"
                          >
                            <Trash2 className="size-3.5" /> Eliminar Moneda
                          </DropdownMenuItem>
                        )}
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
          itemLabel="divisas"
        />
      </div>
    </div>
  );
}

