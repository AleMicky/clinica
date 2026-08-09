"use client";

import * as React from "react";
import {
  Activity,
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  Inbox,
  Sparkles,
  Clock,
  UserCheck,
  History,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DataTablePagination } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { ServicioItem } from "../types/servicio.types";

interface ServicioListProps {
  selectedCategoriaNombre?: string;
  servicios: ServicioItem[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddServicio?: () => void;
  onEdit?: (servicio: ServicioItem) => void;
  onDelete?: (servicio: ServicioItem) => void;
  onRefresh?: () => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function ServicioList({
  selectedCategoriaNombre,
  servicios,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onAddServicio,
  onEdit,
  onDelete,
  onRefresh,
}: ServicioListProps) {
  return (
    <div className="flex flex-col gap-3 bg-card border border-border/60 rounded-xl p-3.5 shadow-2xs h-full">
      {/* Detail Header with Section Add Button */}
      <div className="flex items-center justify-between px-0.5 pt-0.5 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            {selectedCategoriaNombre ? `Servicios: ${selectedCategoriaNombre}` : "Prestaciones y Servicios"}
          </h2>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
            {totalItems}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-7 px-2 text-xs gap-1 cursor-pointer"
              title="Recargar"
            >
              <RefreshCw className={cn("size-3", isLoading && "animate-spin")} />
              <span className="hidden sm:inline text-[11px]">Actualizar</span>
            </Button>
          )}

          {onAddServicio && (
            <Button
              onClick={onAddServicio}
              size="sm"
              className="h-7 px-2.5 text-xs font-medium gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span className="text-[11px]">Nuevo Servicio</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar servicios por código o nombre..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-8 text-xs h-8 bg-muted/30 border-border/60 focus:bg-background w-full"
        />
      </div>

      {/* Services Compact List Items */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto max-h-[520px] pr-0.5 min-h-[220px]">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border border-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))
        ) : servicios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed rounded-lg bg-muted/20 text-center gap-2 my-auto">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Inbox className="size-5 stroke-1" />
            </div>
            <p className="text-xs font-medium text-foreground">Sin servicios registrados</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              {searchTerm
                ? "No se encontraron servicios que coincidan con la búsqueda."
                : "No hay servicios asociados a esta categoría. Haz clic en 'Nuevo Servicio' para agregar uno."}
            </p>
            {onAddServicio && !searchTerm && (
              <Button onClick={onAddServicio} size="sm" variant="outline" className="mt-1 h-7 text-xs gap-1 cursor-pointer">
                <Sparkles className="size-3 text-primary" />
                <span>Agregar Primer Servicio</span>
              </Button>
            )}
          </div>
        ) : (
          servicios.map((srv) => {
            const formattedCreated = formatDate(srv.createdAt);
            const formattedUpdated = formatDate(srv.updatedAt);

            return (
              <div
                key={srv.id}
                className="group border border-border/50 hover:border-primary/40 bg-background/60 hover:bg-muted/30 rounded-lg p-2.5 transition-all duration-150 flex items-center justify-between gap-3"
              >
                {/* Service Info (Code, Name, Description, Audit Pill) */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-mono text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded shrink-0">
                    {srv.codigo}
                  </span>

                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {srv.nombre}
                      </span>
                    </div>

                    {srv.descripcion ? (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {srv.descripcion}
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/60 italic">
                        Sin descripción detallada
                      </p>
                    )}
                  </div>
                </div>

                {/* Audit Pill & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Audit Popover Badge */}
                  <Popover>
                    <PopoverTrigger className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/80 hover:text-foreground bg-muted/50 hover:bg-muted border border-border/40 px-2 py-0.5 rounded transition-colors cursor-pointer">
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
                        {srv.createdBy && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Por:</span>
                            <span className="font-medium flex items-center gap-1">
                              <UserCheck className="size-3 text-muted-foreground" />
                              {srv.createdBy}
                            </span>
                          </div>
                        )}
                        {srv.updatedAt && (
                          <div className="flex justify-between items-center pt-1 border-t border-border/30">
                            <span className="text-muted-foreground">Actualizado:</span>
                            <span className="font-medium">{formattedUpdated || "N/A"}</span>
                          </div>
                        )}
                        {srv.updatedBy && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Modificado por:</span>
                            <span className="font-medium">{srv.updatedBy}</span>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Action Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground/70 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="size-4" />
                      <span className="sr-only">Acciones</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => onEdit?.(srv)}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <Edit className="size-3.5" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(srv)}
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

      {/* Pagination Footer - Only show when more than 10 items */}
      {totalItems > 10 && (
        <DataTablePagination
          totalItems={totalItems}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange || (() => {})}
          onPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
          itemLabel="servicios"
        />
      )}
    </div>
  );
}
