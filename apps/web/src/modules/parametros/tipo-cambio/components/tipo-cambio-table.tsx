"use client";

import * as React from "react";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
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
import { StatusBadge, DataTablePagination } from "@/components/shared";
import type { MonedaResponse } from "../../moneda/types/moneda.types";
import type { TipoCambioResponse } from "../types/tipo-cambio.types";

export interface TipoCambioItem {
  id: number;
  monedaOrigenId: number;
  monedaDestinoId: number;
  monedaOrigenCodigo?: string;
  monedaDestinoCodigo?: string;
  compra: number;
  venta: number;
  fecha: string;
  activo: boolean;
}

interface TipoCambioTableProps {
  tiposCambio: TipoCambioItem[];
  monedasMap?: Map<number, MonedaResponse>;
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
  onEdit?: (item: TipoCambioItem) => void;
  onDelete?: (id: number) => void;
  onRefresh?: () => void;
}

export function TipoCambioTable({
  tiposCambio,
  monedasMap,
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
  onEdit,
  onDelete,
  onRefresh,
}: TipoCambioTableProps) {
  const getMonedaCodigo = (monedaId: number, defaultCode?: string) => {
    if (defaultCode) return defaultCode;
    if (monedasMap && monedasMap.has(monedaId)) {
      return monedasMap.get(monedaId)?.codigo || `ID:${monedaId}`;
    }
    return `ID:${monedaId}`;
  };

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span>Histórico de Tasas de Cambio</span>
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
              Registro oficial de valores de compra y venta de divisas por fecha.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por fecha (YYYY-MM-DD)..."
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
              <TableHead className="pl-6">Fecha</TableHead>
              <TableHead>Par de Monedas</TableHead>
              <TableHead className="text-right">Tasa Compra</TableHead>
              <TableHead className="text-right">Tasa Venta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right pr-6">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeletons
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="pl-6">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
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
                <TableCell colSpan={6} className="h-32 text-center text-destructive">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="size-6 text-destructive" />
                    <p className="font-semibold text-sm">
                      {errorMessage || "Error al cargar los tipos de cambio desde la API."}
                    </p>
                    {onRefresh && (
                      <Button variant="outline" size="sm" onClick={onRefresh} className="mt-1 gap-2 cursor-pointer">
                        <RefreshCw className="size-3.5" /> Reintentar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : tiposCambio.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-sm">
                  No se encontraron registros de tipos de cambio.
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              tiposCambio.map((tc) => {
                const origen = getMonedaCodigo(tc.monedaOrigenId, tc.monedaOrigenCodigo);
                const destino = getMonedaCodigo(tc.monedaDestinoId, tc.monedaDestinoCodigo);

                return (
                  <TableRow key={tc.id}>
                    <TableCell className="pl-6 font-mono text-xs font-semibold">
                      {tc.fecha}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      <Badge variant="outline" className="font-mono gap-1 text-xs py-0.5">
                        <span>{origen}</span>
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <span className="text-primary font-bold">{destino}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {tc.compra.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold text-primary">
                      {tc.venta.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge active={tc.activo} />
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
                              onClick={() => onEdit?.(tc)}
                              className="gap-2 cursor-pointer"
                            >
                              <Edit className="size-4" /> Editar Registro
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete?.(tc.id)}
                            className="gap-2 text-destructive cursor-pointer"
                          >
                            <Trash2 className="size-4" /> Eliminar Registro
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
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
        itemLabel="cotizaciones"
      />
    </Card>
  );
}
