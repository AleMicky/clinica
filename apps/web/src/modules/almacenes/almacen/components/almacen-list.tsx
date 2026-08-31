"use client";

import * as React from "react";
import {
  Warehouse,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Inbox,
  Clock,
  UserCheck,
  History,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DataTablePagination } from "@/components/shared";
import type { AlmacenResponse } from "../types/almacen.types";

interface AlmacenListProps {
  almacenes: AlmacenResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddAlmacen?: () => void;
  onEdit?: (almacen: AlmacenResponse) => void;
  onDelete?: (almacen: AlmacenResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (almacen: AlmacenResponse) => void;
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

export function AlmacenList({
  almacenes,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onAddAlmacen,
  onEdit,
  onDelete,
  onRefresh,
  onViewAudit,
}: AlmacenListProps) {
  return (
    <div className="flex flex-col gap-2.5 bg-card border border-border/60 rounded-xl p-3 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5 pt-0.5 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Warehouse className="size-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Almacenes Registrados
          </h2>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
            {totalItems}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="size-7 cursor-pointer border-border/60"
              title="Recargar almacenes"
              aria-label="Recargar almacenes"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            </Button>
          )}

          {onAddAlmacen && (
            <Button
              onClick={onAddAlmacen}
              size="sm"
              className="h-7 px-2.5 text-xs font-medium gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span className="text-[11px]">Nuevo almacén</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar almacenes por código, nombre o ubicación..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-8 text-xs h-8 bg-muted/30 border-border/60 focus:bg-background w-full"
        />
      </div>

      {/* List Items */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-220px)] min-h-0 pr-0.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-2.5 rounded-lg border border-border/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3.5 w-12" />
              </div>
              <Skeleton className="h-2.5 w-2/3" />
            </div>
          ))
        ) : almacenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed rounded-lg bg-muted/20 text-center gap-2 my-auto">
            <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Inbox className="size-4 stroke-1" />
            </div>
            <p className="text-xs font-medium text-foreground">Sin almacenes registrados</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              {searchTerm
                ? "No se encontraron almacenes que coincidan con la búsqueda."
                : "No hay almacenes registrados. Haz clic en 'Nuevo almacén' para agregar uno."}
            </p>
            {onAddAlmacen && !searchTerm && (
              <Button
                onClick={onAddAlmacen}
                size="sm"
                variant="outline"
                className="mt-1 h-7 text-xs gap-1 cursor-pointer"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Nuevo almacén</span>
              </Button>
            )}
          </div>
        ) : (
          almacenes.map((almacen) => {
            const rawCreated =
              almacen.fechaCreacion ||
              almacen.createdAt ||
              (almacen as any).created_at ||
              (almacen as any).creadoEn;
            const rawUpdated =
              almacen.fechaModificacion ||
              almacen.updatedAt ||
              (almacen as any).updated_at ||
              (almacen as any).actualizadoEn;
            const createdUser =
              almacen.creadoPor ||
              almacen.createdBy ||
              (almacen as any).created_by ||
              (almacen as any).usuarioCreacion;
            const updatedUser =
              almacen.modificadoPor ||
              almacen.updatedBy ||
              (almacen as any).updated_by ||
              (almacen as any).usuarioModificacion;

            const formattedCreated = formatDate(rawCreated);
            const formattedUpdated = formatDate(rawUpdated);

            return (
              <div
                key={almacen.id}
                className="group border border-border/40 hover:border-border bg-background/60 hover:bg-muted/40 rounded-lg px-3 py-2 transition-colors flex items-center justify-between gap-3"
              >
                {/* Code, Name, Description & Location */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="font-mono text-[11px] font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                    {almacen.codigo}
                  </span>

                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="font-medium text-xs text-foreground truncate">
                      {almacen.nombre}
                    </span>

                    {almacen.descripcion ? (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {almacen.descripcion}
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/60 italic">
                        Sin descripción
                      </p>
                    )}

                    {almacen.ubicacion && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                        <MapPin className="size-2.5 shrink-0" />
                        {almacen.ubicacion}
                      </p>
                    )}
                  </div>
                </div>

                {/* Audit & Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Audit Popover */}
                  {onViewAudit ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewAudit(almacen)}
                      className="h-6 px-2 text-[10px] text-muted-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted border border-border/40 gap-1 cursor-pointer"
                      title="Ver Auditoría Completa"
                    >
                      <Clock className="size-3 text-muted-foreground" />
                      <span className="hidden sm:inline">{formattedCreated || "Auditoría"}</span>
                    </Button>
                  ) : (
                    <Popover>
                      <PopoverTrigger
                        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/80 hover:text-foreground bg-muted/40 hover:bg-muted border border-border/40 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        aria-label={`Auditoría de ${almacen.nombre}`}
                      >
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="hidden sm:inline">{formattedCreated || "Auditoría"}</span>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-56 p-3 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 font-semibold border-b pb-1.5 text-foreground">
                          <History className="size-3.5 text-primary" />
                          <span>Detalles de Auditoría</span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Creado:</span>
                            <span className="font-medium">{formattedCreated || "N/A"}</span>
                          </div>
                          {createdUser && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Por:</span>
                              <span className="font-medium flex items-center gap-1">
                                <UserCheck className="size-3 text-muted-foreground" />
                                {createdUser}
                              </span>
                            </div>
                          )}
                          {rawUpdated && (
                            <div className="flex justify-between items-center pt-1 border-t border-border/30">
                              <span className="text-muted-foreground">Actualizado:</span>
                              <span className="font-medium">{formattedUpdated || "N/A"}</span>
                            </div>
                          )}
                          {updatedUser && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Modificado por:</span>
                              <span className="font-medium">{updatedUser}</span>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

                  {/* Action Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex size-6 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground/70 transition-colors cursor-pointer"
                      aria-label={`Acciones de ${almacen.nombre}`}
                    >
                      <MoreVertical className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {onViewAudit && (
                        <DropdownMenuItem
                          onClick={() => onViewAudit(almacen)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <History className="size-3.5" /> Ver Auditoría
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onEdit?.(almacen)}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <Edit className="size-3.5" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(almacen)}
                        className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3.5" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
          itemLabel="almacenes"
        />
      )}
    </div>
  );
}
