"use client";

import * as React from "react";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  CreditCard,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { BancoResponse } from "../types/banco.types";

interface BancoTableProps {
  bancos: BancoResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (banco: BancoResponse) => void;
  onDelete: (banco: BancoResponse) => void;
  onManageCuentas: (banco: BancoResponse) => void;
  onRefresh: () => void;
}

export function BancoTable({
  bancos,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onManageCuentas,
  onRefresh,
}: BancoTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="space-y-4">
      {/* Controles de Búsqueda y Acciones */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nombre o sigla..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[120px]">Código</TableHead>
              <TableHead>Nombre de Entidad Bancaria</TableHead>
              <TableHead className="w-[160px]">Nombre Corto / Sigla</TableHead>
              <TableHead className="w-[120px]">Estado</TableHead>
              <TableHead className="w-[180px] text-center">Cuentas Bancarias</TableHead>
              <TableHead className="w-[80px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-28 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : bancos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Building2 className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">No se encontraron entidades bancarias</p>
                    <p className="text-xs">
                      {searchTerm
                        ? "Intente ajustar los términos de búsqueda."
                        : "Comience creando un nuevo banco."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              bancos.map((banco) => (
                <TableRow key={banco.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {banco.codigo}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {banco.nombre}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {banco.nombreCorto || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={banco.activo ? "default" : "secondary"}
                      className={
                        banco.activo
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/20"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }
                    >
                      {banco.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onManageCuentas(banco)}
                      className="h-8 gap-1.5 text-xs border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Gestionar Cuentas</span>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onManageCuentas(banco)} className="gap-2">
                          <CreditCard className="h-4 w-4 text-primary" />
                          <span>Ver / Agregar Cuentas</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(banco)} className="gap-2">
                          <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span>Editar Banco</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(banco)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Paginación */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Mostrar</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>por página. Total: <strong>{totalItems}</strong> registros</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Anterior</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Siguiente</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
