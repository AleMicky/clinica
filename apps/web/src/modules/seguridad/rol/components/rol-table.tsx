"use client";

import * as React from "react";
import { Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { PagedResult, RolResponse } from "../types/rol.types";
import { RolCard } from "./rol-card";

interface RolTableProps {
  data?: PagedResult<RolResponse>;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (rol: RolResponse) => void;
  onDelete: (rol: RolResponse) => void;
}

export function RolTable({
  data,
  isLoading,
  search,
  onSearchChange,
  onPageChange,
  onEdit,
  onDelete,
}: RolTableProps) {
  const items = data?.items ?? [];
  const page = data?.page ?? 1;
  const totalPages = data ? Math.ceil(data.totalItems / data.pageSize) : 1;

  return (
    <div className="flex flex-col gap-3">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2 bg-card p-2 rounded-md border border-border/60 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre de rol..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Grid of Compact Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-3 rounded-md border bg-card space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center bg-card/50">
          <Shield className="size-8 text-muted-foreground/40 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-foreground">No se encontraron roles</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Intente cambiar el término de búsqueda o registre un nuevo rol.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {items.map((rol) => (
            <RolCard
              key={rol.id}
              rol={rol}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between px-1 pt-1 text-xs">
          <p className="text-[11px] text-muted-foreground">
            Página {page} de {totalPages} ({data.totalItems} roles totales)
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5"
              disabled={!data.hasPreviousPage && page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5"
              disabled={!data.hasNextPage && page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
