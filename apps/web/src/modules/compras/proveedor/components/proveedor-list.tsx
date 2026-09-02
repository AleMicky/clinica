"use client";

import * as React from "react";
import {
  Building2,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Inbox,
  Clock,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { ProveedorResponse } from "../types/proveedor.types";

interface ProveedorListProps {
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
  onEdit?: (proveedor: ProveedorResponse) => void;
  onDelete?: (proveedor: ProveedorResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (proveedor: ProveedorResponse) => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  } catch {
    return dateStr;
  }
}

export function ProveedorList({
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
  onEdit,
  onDelete,
  onRefresh,
  onViewAudit,
}: ProveedorListProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Controls: Search & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, razón social, NIT o contacto..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-8 text-xs h-8 bg-background border-border/60 focus:bg-background w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
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
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            </Button>
          )}

          {onAddProveedor && (
            <Button
              onClick={onAddProveedor}
              size="sm"
              className="h-8 px-3 text-xs font-medium gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span className="text-xs">Nuevo Proveedor</span>
            </Button>
          )}
        </div>
      </div>

      {/* List Container */}
      <div className="flex flex-col gap-2 w-full">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border border-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : proveedores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-lg bg-muted/20 text-center gap-2 my-auto">
            <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Inbox className="size-4 stroke-1" />
            </div>
            <p className="text-xs font-medium text-foreground">
              Sin proveedores encontrados
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              {searchTerm
                ? "No se encontraron proveedores que coincidan con la búsqueda."
                : "No hay registros de proveedores. Haz clic en 'Nuevo Proveedor' para añadir uno."}
            </p>
            {onAddProveedor && !searchTerm && (
              <Button
                onClick={onAddProveedor}
                size="sm"
                variant="outline"
                className="mt-1 h-7 text-xs gap-1 cursor-pointer"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Nuevo Proveedor</span>
              </Button>
            )}
          </div>
        ) : (
          proveedores.map((item) => {
            const rawCreated =
              item.fechaCreacion ||
              item.createdAt ||
              (item as any).created_at ||
              (item as any).creadoEn;
            const formattedCreated = formatDate(rawCreated);

            const phone = item.celular || item.telefono;

            return (
              <div
                key={item.id}
                className="group border border-border/60 hover:border-primary/40 bg-card hover:bg-muted/20 rounded-lg px-3.5 py-2.5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
              >
                {/* Left: Commercial & Corporate Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary text-xs font-semibold">
                    <Building2 className="size-4.5" />
                  </div>

                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border/40 shrink-0">
                        {item.codigo}
                      </span>
                      <span className="font-semibold text-xs text-foreground truncate">
                        {item.razonSocial}
                      </span>
                      {item.nombreComercial && (
                        <span className="text-[11px] text-muted-foreground italic truncate">
                          ({item.nombreComercial})
                        </span>
                      )}
                      {item.nit && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono h-4 px-1.5 py-0 bg-secondary/50 text-secondary-foreground border-border/50"
                        >
                          NIT: {item.nit}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground flex-wrap">
                      {item.contacto && (
                        <span className="inline-flex items-center gap-1 bg-muted/40 px-1.5 py-0.5 rounded border border-border/30">
                          <User className="size-3 text-muted-foreground" />
                          <span>{item.contacto}</span>
                        </span>
                      )}

                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="inline-flex items-center gap-1 bg-muted/40 hover:bg-muted/70 px-1.5 py-0.5 rounded border border-border/30 transition-colors"
                          title="Llamar"
                        >
                          <Phone className="size-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{phone}</span>
                        </a>
                      )}

                      {item.email && (
                        <a
                          href={`mailto:${item.email}`}
                          className="inline-flex items-center gap-1 bg-muted/40 hover:bg-muted/70 px-1.5 py-0.5 rounded border border-border/30 transition-colors"
                          title="Enviar correo"
                        >
                          <Mail className="size-3 text-blue-600 dark:text-blue-400" />
                          <span className="truncate max-w-[160px]">{item.email}</span>
                        </a>
                      )}

                      {item.direccion && (
                        <span className="inline-flex items-center gap-1 bg-muted/40 px-1.5 py-0.5 rounded border border-border/30 truncate max-w-[200px]" title={item.direccion}>
                          <MapPin className="size-3 text-muted-foreground" />
                          <span className="truncate">{item.direccion}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Observacion & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/30">
                  {item.observacion && (
                    <div className="hidden xl:flex items-center gap-1 text-[11px] text-muted-foreground max-w-[220px] truncate" title={item.observacion}>
                      <FileText className="size-3 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">{item.observacion}</span>
                    </div>
                  )}

                  {/* Audit & Dropdown Actions */}
                  <div className="flex items-center gap-1.5">
                    {onViewAudit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewAudit(item)}
                        className="h-6 px-2 text-[10px] text-muted-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted border border-border/40 gap-1 cursor-pointer"
                        title="Ver Auditoría Completa"
                      >
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="hidden lg:inline">
                          {formattedCreated || "Auditoría"}
                        </span>
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="inline-flex size-6 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground/70 transition-colors cursor-pointer"
                        aria-label="Acciones de proveedor"
                      >
                        <MoreVertical className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {onViewAudit && (
                          <DropdownMenuItem
                            onClick={() => onViewAudit(item)}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <Clock className="size-3.5" /> Ver Auditoría
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => onEdit?.(item)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <Edit className="size-3.5" /> Editar Proveedor
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(item)}
                          className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-3.5" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
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
