"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Filter,
} from "lucide-react";
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
    <Card className="shadow-xs">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Listado de Unidades</span>
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
              Unidades de medida de prescripción, laboratorio y dosificación clínica.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
            <SearchInput
              placeholder="Buscar por código, nombre o símbolo..."
              value={searchTerm}
              onChange={onSearchChange}
              className="w-full sm:w-64"
            />
            {onCategoriaFilterChange && (
              <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/20 overflow-x-auto">
                <Filter className="size-3.5 text-muted-foreground ml-1 shrink-0" />
                {categorias.map((cat) => (
                  <Button
                    key={cat}
                    variant={categoriaFilter === cat ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onCategoriaFilterChange(cat)}
                    className="h-7 text-xs px-2.5 shrink-0"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Código</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Símbolo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="pl-6">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
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
            ) : unidades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-sm">
                  No se encontraron unidades de medida registradas o coincidentes.
                </TableCell>
              </TableRow>
            ) : (
              unidades.map((unidad) => (
                <TableRow key={unidad.id}>
                  <TableCell className="pl-6 font-mono font-bold text-sm text-primary">
                    {unidad.codigo}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {unidad.nombre}
                  </TableCell>
                  <TableCell className="font-mono font-semibold text-muted-foreground">
                    {unidad.simbolo}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {unidad.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={unidad.activo} />
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
                            onClick={() => onEdit?.(unidad)}
                            className="gap-2 cursor-pointer"
                          >
                            <Edit className="size-4" /> Editar Unidad
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(unidad)}
                          className="gap-2 text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-4" /> Eliminar Unidad
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <DataTablePagination
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange || (() => {})}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
        itemLabel="unidades"
      />
    </Card>
  );
}
