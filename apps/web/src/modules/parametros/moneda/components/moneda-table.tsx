"use client";

import * as React from "react";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import type { Moneda, MonedaResponse } from "../types/moneda.types";

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
  isError?: boolean;
  errorMessage?: string;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSetMonedaBase?: (id: number | string) => void;
  onEdit?: (moneda: MonedaItem) => void;
  onInactivate?: (id: number | string) => void;
  onRefresh?: () => void;
}

export function MonedaTable({
  monedas,
  isLoading = false,
  isError = false,
  errorMessage,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onSetMonedaBase,
  onEdit,
  onInactivate,
  onRefresh,
}: MonedaTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toItem = Math.min(totalItems, currentPage * pageSize);

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Listado de Divisas
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  title="Recargar datos de la API"
                >
                  <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Monedas obtenidas directamente de la API backend de la clínica.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código o nombre..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
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
            ) : isError ? (
              // Error State
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-destructive">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="size-6 text-destructive" />
                    <p className="font-semibold text-sm">
                      {errorMessage || "Error al cargar la información desde la API."}
                    </p>
                    {onRefresh && (
                      <Button variant="outline" size="sm" onClick={onRefresh} className="mt-1 gap-2">
                        <RefreshCw className="size-3.5" /> Reintentar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
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
                    <Badge
                      variant={moneda.activo ? "outline" : "destructive"}
                      className={`w-fit gap-1 text-xs ${
                        moneda.activo
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : ""
                      }`}
                    >
                      {moneda.activo ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <XCircle className="size-3" />
                      )}
                      {moneda.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                        <DropdownMenuSeparator />
                        {!moneda.esBase && (
                          <DropdownMenuItem
                            onClick={() => onInactivate?.(moneda.id)}
                            className="gap-2 text-destructive cursor-pointer"
                          >
                            <Trash2 className="size-4" /> Inactivar
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

      {/* Pie de Tabla con Controles de Paginación */}
      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/50 text-sm">
        {/* Información de Registros */}
        <div className="text-xs text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{fromItem}</span> a{" "}
          <span className="font-semibold text-foreground">{toItem}</span> de{" "}
          <span className="font-semibold text-foreground">{totalItems}</span> divisas
        </div>

        {/* Selector de Filas por Página y Botones de Navegación */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filas por página</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange?.(Number(val))}
            >
              <SelectTrigger className="h-8 w-16 text-xs">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2 font-medium">
              Página {currentPage} de {totalPages}
            </span>

            {/* Primera Página */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => onPageChange?.(1)}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronsLeft className="size-4" />
              <span className="sr-only">Primera página</span>
            </Button>

            {/* Página Anterior */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Página anterior</span>
            </Button>

            {/* Página Siguiente */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || isLoading}
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Página siguiente</span>
            </Button>

            {/* Última Página */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => onPageChange?.(totalPages)}
              disabled={currentPage >= totalPages || isLoading}
            >
              <ChevronsRight className="size-4" />
              <span className="sr-only">Última página</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
