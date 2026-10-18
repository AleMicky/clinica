"use client";

import * as React from "react";
import {
  Tag,
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { MarcaResponse } from "../types/marca.types";

export interface MarcaListProps {
  marcas: MarcaResponse[];
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onAddMarca?: () => void;
  onEdit?: (marca: MarcaResponse) => void;
  onDelete?: (marca: MarcaResponse) => void;
  onRefresh?: () => void;
  onViewAudit?: (marca: MarcaResponse) => void;
  selectedIds?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
  onDeleteMultiple?: (selectedIds: number[]) => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime())
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

export function MarcaList({
  marcas,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  searchTerm = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onAddMarca,
  onEdit,
  onDelete,
  onRefresh,
  onViewAudit,
  selectedIds = [],
  onSelectionChange,
  onDeleteMultiple,
}: Readonly<MarcaListProps>) {
  const isAllSelected =
    marcas.length > 0 &&
    marcas.every((item) => selectedIds.includes(item.id));

  const handleToggleAll = () => {
    if (!onSelectionChange) return;

    if (isAllSelected) {
      const currentPageIds = new Set(marcas.map((m) => m.id));
      onSelectionChange(selectedIds.filter((id) => !currentPageIds.has(id)));
    } else {
      const updated = new Set([...selectedIds, ...marcas.map((m) => m.id)]);
      onSelectionChange(Array.from(updated));
    }
  };

  const handleToggleItem = (id: number) => {
    if (!onSelectionChange) return;

    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleClearSelection = () => {
    onSelectionChange?.([]);
  };

  return (
    <div className="flex flex-col gap-2.5 bg-card border border-border/60 rounded-xl p-3 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5 pt-0.5 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          {marcas.length > 0 && onSelectionChange && (
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleToggleAll}
              aria-label="Seleccionar todas las marcas de esta página"
              className="cursor-pointer"
            />
          )}
          <Tag className="size-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Marcas Registradas
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
              title="Recargar marcas"
              aria-label="Recargar marcas"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            </Button>
          )}

          {onAddMarca && (
            <Button
              onClick={onAddMarca}
              size="sm"
              className="h-7 px-2.5 text-xs font-medium gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span className="text-[11px]">Nueva marca</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar marcas por código, nombre o descripción..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-8 text-xs h-8 bg-muted/30 border-border/60 focus:bg-background w-full"
        />
      </div>

      {/* Bulk Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/25 text-foreground animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-mono text-xs px-2 py-0.5">
              {selectedIds.length}
            </Badge>
            <span className="text-xs font-medium">
              {selectedIds.length === 1
                ? "1 marca seleccionada"
                : `${selectedIds.length} marcas seleccionadas`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Deseleccionar
            </Button>

            {onDeleteMultiple && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteMultiple(selectedIds)}
                className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer font-medium shadow-2xs"
              >
                <Trash2 className="size-3.5" />
                <span>Eliminar seleccionadas ({selectedIds.length})</span>
              </Button>
            )}
          </div>
        </div>
      )}

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
        ) : marcas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed rounded-lg bg-muted/20 text-center gap-2 my-auto">
            <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Inbox className="size-4 stroke-1" />
            </div>
            <p className="text-xs font-medium text-foreground">Sin marcas registradas</p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              {searchTerm
                ? "No se encontraron marcas que coincidan con la búsqueda."
                : "No hay marcas registradas. Haz clic en 'Nueva marca' para agregar una."}
            </p>
            {onAddMarca && !searchTerm && (
              <Button
                onClick={onAddMarca}
                size="sm"
                variant="outline"
                className="mt-1 h-7 text-xs gap-1 cursor-pointer"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Nueva marca</span>
              </Button>
            )}
          </div>
        ) : (
          marcas.map((marca) => {
            const isSelected = selectedIds.includes(marca.id);
            const rawCreated =
              marca.fechaCreacion ||
              marca.createdAt ||
              marca.created_at ||
              marca.creadoEn;
            const rawUpdated =
              marca.fechaModificacion ||
              marca.updatedAt ||
              marca.updated_at ||
              marca.actualizadoEn;
            const createdUser =
              marca.creadoPor ||
              marca.createdBy ||
              marca.created_by ||
              marca.usuarioCreacion;
            const updatedUser =
              marca.modificadoPor ||
              marca.updatedBy ||
              marca.updated_by ||
              marca.usuarioModificacion;

            const formattedCreated = formatDate(rawCreated);
            const formattedUpdated = formatDate(rawUpdated);

            return (
              <div
                key={marca.id}
                className={cn(
                  "group border border-border/40 hover:border-border bg-background/60 hover:bg-muted/40 rounded-lg px-3 py-2 transition-colors flex items-center justify-between gap-3",
                  isSelected && "bg-primary/5 dark:bg-primary/10 border-primary/40 hover:bg-primary/10"
                )}
              >
                {/* Checkbox, Code, Name & Description */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {onSelectionChange && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleItem(marca.id)}
                      aria-label={`Seleccionar marca ${marca.nombre}`}
                      className="cursor-pointer shrink-0"
                    />
                  )}

                  <span className="font-mono text-[11px] font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                    {marca.codigo}
                  </span>

                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="font-medium text-xs text-foreground truncate">
                      {marca.nombre}
                    </span>

                    {marca.descripcion ? (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {marca.descripcion}
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/60 italic">
                        Sin descripción
                      </p>
                    )}
                  </div>
                </div>

                {/* Audit & Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Audit Popover / Dialog button */}
                  {onViewAudit ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewAudit(marca)}
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
                        aria-label={`Auditoría de ${marca.nombre}`}
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
                      aria-label={`Acciones de ${marca.nombre}`}
                    >
                      <MoreVertical className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {onViewAudit && (
                        <DropdownMenuItem
                          onClick={() => onViewAudit(marca)}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <History className="size-3.5" /> Ver Auditoría
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onEdit?.(marca)}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <Edit className="size-3.5" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(marca)}
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
          itemLabel="marcas"
        />
      )}
    </div>
  );
}
