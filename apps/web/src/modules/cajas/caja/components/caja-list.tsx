"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SearchInput,
  DataTablePagination,
} from "@/components/shared";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Vault,
  RefreshCw,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CajaResponse } from "../types/caja.types";

interface CajaListProps {
  cajas: CajaResponse[];
  selectedCajaId?: number | null;
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  onSelectCaja?: (caja: CajaResponse) => void;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (caja: CajaResponse) => void;
  onDelete: (caja: CajaResponse) => void;
  onRefresh?: () => void;
}

export function CajaList({
  cajas,
  selectedCajaId,
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  searchTerm,
  onSelectCaja,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onRefresh,
}: CajaListProps) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-border/60 bg-card p-3 shadow-2xs space-y-2.5">
      {/* Cabecera del Listado Maestro */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/40">
        <div className="flex items-center gap-1.5 min-w-0">
          <Vault className="size-4 text-primary shrink-0" />
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider truncate">
            Puntos de Caja
          </h2>
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
            {totalItems}
          </span>
        </div>

        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            title="Actualizar cajas"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        )}
      </div>

      {/* Buscador */}
      <div className="w-full">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar por código o nombre..."
          className="h-7.5 text-xs bg-muted/30 shadow-none border-border/60 focus:bg-background"
        />
      </div>

      {/* Contenedor con Scroll de la Lista */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-310px)] min-h-[280px] space-y-1.5 pr-0.5 scrollbar-thin">
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-2 rounded-lg border border-border/40 bg-card/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3.5 w-12" />
                </div>
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        ) : cajas.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-border/60 rounded-lg bg-muted/10 space-y-1.5">
            <Vault className="size-6 text-muted-foreground/40 mx-auto" />
            <p className="font-semibold text-xs text-foreground">Sin cajas encontradas</p>
            <p className="text-[10px] max-w-[200px] mx-auto text-muted-foreground">
              {searchTerm
                ? "Ajuste los términos de búsqueda."
                : "Agregue una nueva caja para comenzar."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {cajas.map((caja) => {
              const isSelected = selectedCajaId === caja.id;
              return (
                <div
                  key={caja.id}
                  onClick={() => onSelectCaja?.(caja)}
                  className={`group relative p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? "border-primary bg-primary/[0.08] shadow-xs border-l-[3.5px] border-l-primary"
                      : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  {/* Bloque Izquierdo: Código + Nombre + Descripción */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`font-mono font-bold text-[10px] px-1 py-0.2 rounded border ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
                        {caja.codigo}
                      </span>

                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                        } transition-colors`}
                      >
                        {caja.nombre}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                      {caja.descripcion || "Sin descripción"}
                    </p>
                  </div>

                  {/* Bloque Derecho: Badge + Acciones */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant={caja.activo ? "default" : "secondary"}
                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                        caja.activo
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {caja.activo ? "Activa" : "Inactiva"}
                    </Badge>

                    {/* Menú de Acciones Rápidas */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="size-6.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors border border-border/50 cursor-pointer"
                      >
                        <MoreVertical className="size-3" />
                        <span className="sr-only">Opciones</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32 text-xs">
                        <DropdownMenuLabel className="text-[10px]">Caja</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(caja);
                          }}
                          className="gap-2 cursor-pointer text-xs"
                        >
                          <Pencil className="size-3 text-amber-600" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(caja);
                          }}
                          className="gap-2 text-destructive focus:text-destructive cursor-pointer text-xs"
                        >
                          <Trash2 className="size-3" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <ChevronRight
                      className={`size-3.5 transition-transform ${
                        isSelected
                          ? "text-primary translate-x-0.5"
                          : "text-muted-foreground/40 group-hover:text-muted-foreground"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paginación Compacta */}
      {totalItems > 10 && (
        <div className="pt-1 border-t border-border/40">
          <DataTablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
