"use client";

import * as React from "react";
import {
  ChevronRight,
  Edit,
  Lock,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PagedResult, RolResponse } from "../types/rol.types";
import { getRoleColorTheme } from "./rol-card";
import { cn } from "@/lib/utils";

interface RolMasterListProps {
  data?: PagedResult<RolResponse>;
  isLoading: boolean;
  selectedRolId: number | null;
  onSelectRol: (rol: RolResponse) => void;
  search: string;
  onSearchChange: (val: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (rol: RolResponse) => void;
  onDelete: (rol: RolResponse) => void;
}

export function RolMasterList({
  data,
  isLoading,
  selectedRolId,
  onSelectRol,
  search,
  onSearchChange,
  page,
  onPageChange,
  onEdit,
  onDelete,
}: RolMasterListProps) {
  const items = data?.items ?? [];
  const totalPages = data ? Math.ceil(data.totalItems / data.pageSize) : 1;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
      {/* Top Search Bar */}
      <div className="p-3 border-b border-border/60 bg-muted/20">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar roles..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs bg-background"
          />
        </div>
      </div>

      {/* Role Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[360px] max-h-[calc(100vh-280px)]">
        {isLoading ? (
          <div className="space-y-2 p-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border bg-card/60 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-7 rounded-md" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-2.5 w-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg bg-card/40 my-2">
            <Shield className="size-7 text-muted-foreground/40 mb-1.5" />
            <p className="text-xs font-semibold text-foreground">
              No se encontraron roles
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {search
                ? `Sin coincidencias para "${search}"`
                : "No hay roles registrados."}
            </p>
          </div>
        ) : (
          items.map((rol) => {
            const isSelected = rol.id === selectedRolId;
            const esProtegido = rol.name.toUpperCase() === "ADMINISTRADOR";
            const theme = getRoleColorTheme(rol.name);

            return (
              <div
                key={rol.id}
                onClick={() => onSelectRol(rol)}
                className={cn(
                  "group relative flex flex-col gap-1.5 p-2.5 rounded-lg border transition-all duration-150 cursor-pointer text-left select-none",
                  isSelected
                    ? "bg-primary/5 border-primary shadow-2xs ring-1 ring-primary/25 dark:bg-primary/10"
                    : "bg-card border-border/60 hover:bg-accent/40 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-medium transition-transform",
                        theme.iconBg
                      )}
                    >
                      {esProtegido ? (
                        <Lock className="size-3.5" />
                      ) : (
                        <Shield className="size-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4
                        className={cn(
                          "font-bold text-xs truncate leading-tight",
                          isSelected ? "text-primary" : "text-foreground"
                        )}
                      >
                        {rol.name}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ID #{rol.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {esProtegido ? (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] px-1 py-0 h-4 font-medium"
                      >
                        Sistema
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] px-1 py-0 h-4 font-medium"
                      >
                        Personalizado
                      </Badge>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <MoreHorizontal className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(rol);
                          }}
                          className="text-xs"
                        >
                          <Edit className="mr-2 size-3.5" />
                          Editar Rol
                        </DropdownMenuItem>
                        {!esProtegido && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(rol);
                            }}
                            className="text-xs text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-3.5" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {isSelected && (
                      <ChevronRight className="size-4 text-primary shrink-0 hidden sm:block" />
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">
                  {rol.descripcion || "Sin descripción asignada."}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {data && totalPages > 1 && (
        <div className="p-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs">
          <span className="text-[11px] text-muted-foreground">
            Pág. {page} de {totalPages} ({data.totalItems})
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[11px] px-2"
              disabled={!data.hasPreviousPage && page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Ant.
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[11px] px-2"
              disabled={!data.hasNextPage && page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Sig.
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
