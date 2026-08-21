"use client";

import * as React from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SearchInput,
  DataTablePagination,
} from "@/components/shared";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CreditCard,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import type { MetodoPagoResponse } from "../types/metodo-pago.types";

interface MetodoPagoTableProps {
  metodos: MetodoPagoResponse[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (metodo: MetodoPagoResponse) => void;
  onDelete: (metodo: MetodoPagoResponse) => void;
}

export function MetodoPagoTable({
  metodos,
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
}: MetodoPagoTableProps) {
  return (
    <div className="space-y-3">
      {/* Controles de Búsqueda */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar por código o nombre..."
            className="h-8.5 text-xs bg-background"
          />
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="h-9">
              <TableHead className="w-[120px] text-xs py-2">Código</TableHead>
              <TableHead className="text-xs py-2">Nombre del Método</TableHead>
              <TableHead className="w-[180px] text-xs py-2 text-center">
                Requiere Referencia
              </TableHead>
              <TableHead className="w-[100px] text-xs py-2 text-center">
                Estado
              </TableHead>
              <TableHead className="w-[80px] text-right text-xs py-2">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow key={idx} className="h-11">
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </TableCell>
                  <TableCell className="py-2">
                    <Skeleton className="h-7 w-7 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : metodos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground py-6">
                    <CreditCard className="size-8 text-muted-foreground/40" />
                    <p className="text-xs font-semibold text-foreground">
                      No se encontraron métodos de pago
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                      {searchTerm
                        ? "Intente ajustar los términos de búsqueda."
                        : "Haga clic en 'Nuevo Método de Pago' para registrar formas de cobro en caja."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              metodos.map((m) => (
                <TableRow
                  key={m.id}
                  className="hover:bg-muted/30 transition-colors h-11"
                >
                  <TableCell className="py-2">
                    <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                      {m.codigo}
                    </span>
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="font-semibold text-xs text-foreground">
                        {m.nombre}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-2 text-center">
                    {m.requiereReferencia ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium gap-1"
                      >
                        <FileText className="size-2.5" />
                        Sí (Voucher/Ref)
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        No requerida
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="py-2 text-center">
                    {m.activo ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-medium"
                      >
                        <CheckCircle2 className="size-2.5" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-muted text-muted-foreground border-border gap-1 font-medium"
                      >
                        <XCircle className="size-2.5" />
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        type="button"
                        className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                      >
                        <MoreHorizontal className="size-3.5" />
                        <span className="sr-only">Acciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 text-xs">
                        <DropdownMenuLabel className="text-[11px]">
                          Acciones
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onEdit(m)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <Pencil className="size-3.5" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(m)}
                          className="gap-2 text-xs text-rose-600 focus:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
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
      </div>

      {/* Paginación */}
      <DataTablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
