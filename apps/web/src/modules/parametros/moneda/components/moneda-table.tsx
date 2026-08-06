"use client";

import * as React from "react";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
    <Card className="shadow-xs">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Listado de Divisas</span>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  title="Recargar datos de la API"
                  className="cursor-pointer"
                >
                  <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Monedas obtenidas directamente de la API backend de la clínica.
            </CardDescription>
          </div>
          <SearchInput
            placeholder="Buscar por código o nombre..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Código ISO</TableHead>
              <TableHead>Símbolo</TableHead>
              <TableHead>Nombre de la Moneda</TableHead>
              <TableHead>Decimales</TableHead>
              <TableHead>Tipo de Moneda</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton Loader Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="pl-6">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : monedas.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={7} className="h-28 text-center text-muted-foreground text-sm">
                  No se encontraron monedas registradas o coincidentes.
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows from API
              monedas.map((moneda) => (
                <TableRow key={moneda.id}>
                  <TableCell className="pl-6 font-mono font-bold text-sm">
                    {moneda.codigo}
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {moneda.simbolo}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {moneda.nombre}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {moneda.decimales} decimales
                  </TableCell>
                  <TableCell>
                    {moneda.esBase ? (
                      <Badge variant="default" className="gap-1 text-xs">
                        <Star className="size-3 fill-current" /> Moneda Base
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Secundaria
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={moneda.activo} />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onEdit?.(moneda)}
                            className="gap-2 cursor-pointer"
                          >
                            <Edit className="size-4" /> Editar Moneda
                          </DropdownMenuItem>
                          {!moneda.esBase && (
                            <DropdownMenuItem
                              onClick={() => onSetMonedaBase?.(moneda.id)}
                              className="gap-2 cursor-pointer"
                            >
                              <Star className="size-4 text-amber-500" /> Establecer como Moneda Base
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        {!moneda.esBase && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteAction?.(moneda.id)}
                            className="gap-2 text-destructive cursor-pointer"
                          >
                            <Trash2 className="size-4" /> Eliminar Moneda
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
      </CardContent>

      {/* Pie de Tabla con Controles de Paginación Centralizados */}
      <DataTablePagination
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange || (() => {})}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
        itemLabel="divisas"
      />
    </Card>
  );
}
