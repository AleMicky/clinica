"use client";

import * as React from "react";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  User,
  Clock,
  FileSpreadsheet,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DataTablePagination,
  EmptyState,
  SearchInput,
  TableSkeletonRows,
} from "@/components/shared";
import { cn } from "@/lib/utils";
import type { ProveedorResponse } from "../types/proveedor.types";

export interface ProveedorTableProps {
  proveedores: ProveedorResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddProveedor?: () => void;
  onImportClick?: () => void;
  onEdit?: (proveedor: ProveedorResponse) => void;
  onDelete?: (proveedor: ProveedorResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (proveedor: ProveedorResponse) => void;
}

export function ProveedorTable({
  proveedores,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onAddProveedor,
  onImportClick,
  onEdit,
  onDelete,
  onRefresh,
  onViewAudit,
}: ProveedorTableProps) {
  return (
    <div className="space-y-3 w-full">
      {/* Toolbar: Search & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <SearchInput
          placeholder="Buscar por código, razón social, NIT o contacto..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full sm:w-80"
          inputClassName="h-8 text-xs bg-background"
        />

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="size-8 cursor-pointer border-border/60"
              title="Recargar datos"
              aria-label="Recargar datos"
            >
              <RefreshCw
                className={cn("size-3.5", isLoading && "animate-spin")}
              />
            </Button>
          )}

          {onImportClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onImportClick}
              className="h-8 px-2.5 text-xs font-medium gap-1.5 text-primary border-primary/25 hover:bg-primary/10 cursor-pointer shadow-2xs"
              title="Importar proveedores desde Excel (.xlsx)"
            >
              <FileSpreadsheet className="size-3.5" />
              <span>Importar Excel</span>
            </Button>
          )}

          {onAddProveedor && (
            <Button
              onClick={onAddProveedor}
              size="sm"
              className="h-8 px-3 text-xs font-medium gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Nuevo Proveedor</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-border/60 bg-card overflow-hidden shadow-2xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[110px] text-xs font-semibold">
                Código
              </TableHead>
              <TableHead className="min-w-[220px] text-xs font-semibold">
                Razón Social / Comercial
              </TableHead>
              <TableHead className="w-[140px] text-xs font-semibold">
                NIT / RUC
              </TableHead>
              <TableHead className="min-w-[160px] text-xs font-semibold">
                Contacto
              </TableHead>
              <TableHead className="min-w-[200px] text-xs font-semibold">
                Teléfono / Email
              </TableHead>
              <TableHead className="min-w-[200px] text-xs font-semibold hidden md:table-cell">
                Dirección
              </TableHead>
              <TableHead className="w-[80px] text-right text-xs font-semibold pr-4">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableSkeletonRows rows={pageSize > 10 ? 10 : pageSize} columns={7} />
            ) : proveedores.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-64 p-0">
                  <EmptyState
                    icon={Building2}
                    title="No se encontraron proveedores"
                    description={
                      searchTerm
                        ? `No hay resultados que coincidan con "${searchTerm}".`
                        : "No hay registros de proveedores creados actualmente."
                    }
                    action={
                      onAddProveedor && !searchTerm
                        ? {
                            label: "Nuevo Proveedor",
                            icon: Plus,
                            onClick: onAddProveedor,
                          }
                        : undefined
                    }
                    className="border-0 bg-transparent py-12"
                  />
                </TableCell>
              </TableRow>
            ) : (
              proveedores.map((item) => {
                const phone = item.celular || item.telefono;

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Código */}
                    <TableCell className="font-mono text-xs font-semibold py-3 align-top">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-muted/80 border border-border/50 text-foreground">
                        {item.codigo}
                      </span>
                    </TableCell>

                    {/* Razón Social y Nombre Comercial */}
                    <TableCell className="py-3 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-xs text-foreground">
                          {item.razonSocial}
                        </span>
                        {item.nombreComercial && (
                          <span className="text-[11px] text-muted-foreground italic">
                            {item.nombreComercial}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* NIT / RUC */}
                    <TableCell className="py-3 align-top">
                      {item.nit ? (
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] h-4.5 px-1.5 bg-secondary/40 text-secondary-foreground border-border/60"
                        >
                          {item.nit}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </TableCell>

                    {/* Contacto */}
                    <TableCell className="py-3 align-top">
                      {item.contacto ? (
                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                          <User className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[150px]" title={item.contacto}>
                            {item.contacto}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </TableCell>

                    {/* Teléfono / Email */}
                    <TableCell className="py-3 align-top">
                      <div className="flex flex-col gap-1 text-xs">
                        {phone && (
                          <a
                            href={`tel:${phone}`}
                            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                            title="Llamar"
                          >
                            <Phone className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{phone}</span>
                          </a>
                        )}

                        {item.email && (
                          <a
                            href={`mailto:${item.email}`}
                            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                            title="Enviar correo"
                          >
                            <Mail className="size-3 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="truncate max-w-[180px]">
                              {item.email}
                            </span>
                          </a>
                        )}

                        {!phone && !item.email && (
                          <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Dirección */}
                    <TableCell className="py-3 align-top hidden md:table-cell">
                      {item.direccion ? (
                        <div
                          className="flex items-center gap-1.5 text-xs text-muted-foreground truncate max-w-[220px]"
                          title={item.direccion}
                        >
                          <MapPin className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{item.direccion}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="py-3 align-top text-right pr-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          aria-label="Acciones de proveedor"
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {onViewAudit && (
                            <DropdownMenuItem
                              onClick={() => onViewAudit(item)}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Clock className="size-3.5 text-muted-foreground" />
                              <span>Ver Auditoría</span>
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem
                              onClick={() => onEdit(item)}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Edit className="size-3.5 text-muted-foreground" />
                              <span>Editar Proveedor</span>
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDelete(item)}
                                className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                                <span>Eliminar</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalItems > 10 && (
        <DataTablePagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange || (() => {})}
          onPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
          itemLabel="proveedores"
        />
      )}
    </div>
  );
}

// Export alias for backward compatibility
export const ProveedorList = ProveedorTable;
export type ProveedorListProps = ProveedorTableProps;
