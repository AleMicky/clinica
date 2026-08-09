"use client";

import * as React from "react";
import {
  Layers,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Clock,
  UserCheck,
  History,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { CategoriaServicioResponse } from "../types/categoria-servicio.types";

interface CategoriaServicioListProps {
  categorias: CategoriaServicioResponse[];
  selectedCategoriaId: number | null;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectCategoria: (categoria: CategoriaServicioResponse) => void;
  onEditCategoria: (categoria: CategoriaServicioResponse) => void;
  onDeleteCategoria: (categoria: CategoriaServicioResponse) => void;
  onAddCategoria: () => void;
  onRefresh?: () => void;
  onViewAudit?: (categoria: CategoriaServicioResponse) => void;
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

export function CategoriaServicioList({
  categorias,
  selectedCategoriaId,
  isLoading,
  searchTerm,
  onSearchChange,
  onSelectCategoria,
  onEditCategoria,
  onDeleteCategoria,
  onAddCategoria,
  onRefresh,
  onViewAudit,
}: CategoriaServicioListProps) {
  return (
    <div className="flex flex-col gap-2.5 bg-card border border-border/60 rounded-xl p-3 shadow-2xs">
      {/* Header with Title & Add button */}
      <div className="flex items-center justify-between px-0.5 pt-0.5 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Layers className="size-4 text-primary" />
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Categorías
          </h2>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
            {categorias.length}
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
              title="Recargar categorías"
              aria-label="Recargar categorías"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            </Button>
          )}
          <Button
            onClick={onAddCategoria}
            size="sm"
            className="h-7 px-2.5 text-xs font-medium gap-1 cursor-pointer shadow-2xs"
            title="Agregar Categoría"
          >
            <Plus className="size-3.5" />
            <span className="text-[11px]">Nueva categoría</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar categoría..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 text-xs h-8 bg-muted/30 border-border/60 focus:bg-background"
        />
      </div>

      {/* Categories Items List */}
      <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-220px)] min-h-0 pr-0.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-2 rounded-md border border-border/40 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          ))
        ) : categorias.length === 0 ? (
          <div className="p-4 text-center border border-dashed rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {searchTerm ? "No hay resultados." : "Sin categorías registradas."}
            </p>
          </div>
        ) : (
          categorias.map((cat) => {
            const isSelected = selectedCategoriaId === cat.id;
            const serviciosCount = cat.cantidadServicios ?? cat.totalServicios ?? cat.serviciosCount;

            const rawCreated = cat.fechaCreacion || cat.createdAt || (cat as any).created_at || (cat as any).creadoEn;
            const rawUpdated = cat.fechaModificacion || cat.updatedAt || (cat as any).updated_at || (cat as any).actualizadoEn;
            const createdUser = cat.creadoPor || cat.createdBy || (cat as any).created_by || (cat as any).usuarioCreacion;
            const updatedUser = cat.modificadoPor || cat.updatedBy || (cat as any).updated_by || (cat as any).usuarioModificacion;

            const formattedCreated = formatDate(rawCreated);
            const formattedUpdated = formatDate(rawUpdated);

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategoria(cat)}
                className={`group cursor-pointer rounded-lg px-2.5 py-2 transition-colors border flex items-center justify-between gap-2 relative ${
                  isSelected
                    ? "border-primary/50 bg-accent text-accent-foreground border-l-3 border-l-primary font-medium shadow-2xs"
                    : "border-border/40 hover:border-border hover:bg-muted/50 bg-background/40 text-foreground"
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-xs tracking-tight truncate">
                      {cat.nombre}
                    </span>
                    {typeof serviciosCount === "number" && (
                      <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded shrink-0">
                        {serviciosCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {cat.codigo}
                    </span>
                    {cat.descripcion && (
                      <span className="text-[10px] text-muted-foreground/80 truncate">
                        • {cat.descripcion}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {/* Audit Popover or Dialog Button */}
                  {onViewAudit ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onViewAudit(cat);
                      }}
                      className="size-6 rounded hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                      title="Ver Auditoría Completa"
                      aria-label={`Auditoría de ${cat.nombre}`}
                    >
                      <Clock className="size-3" />
                    </Button>
                  ) : (
                    <Popover>
                      <PopoverTrigger
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="inline-flex items-center justify-center size-6 rounded hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                        title="Ver Auditoría"
                        aria-label={`Auditoría de ${cat.nombre}`}
                      >
                        <Clock className="size-3" />
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-52 p-3 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 font-semibold border-b pb-1 text-foreground">
                          <History className="size-3.5 text-primary" />
                          <span>Auditoría de Categoría</span>
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

                  {/* Action Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      className="inline-flex size-6 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      aria-label={`Acciones de ${cat.nombre}`}
                    >
                      <MoreVertical className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {onViewAudit && (
                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onViewAudit(cat);
                          }}
                          className="gap-2 text-xs cursor-pointer"
                        >
                          <History className="size-3.5" /> Ver Auditoría
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onEditCategoria(cat);
                        }}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <Edit className="size-3.5" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onDeleteCategoria(cat);
                        }}
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
    </div>
  );
}
