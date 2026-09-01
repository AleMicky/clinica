"use client";

import * as React from "react";
import { X, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "./search-input";
import { cn } from "@/lib/utils";

export interface StatusOption {
  label: string;
  value: string;
}

export interface DataTableToolbarProps {
  // Búsqueda
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Filtro de estado
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: StatusOption[];
  statusPlaceholder?: string;

  // Contadores
  totalCount?: number;
  filteredCount?: number;

  // Acciones de recarga y reset
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onResetFilters?: () => void;

  // Slots adicionales
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar registros...",
  statusValue,
  onStatusChange,
  statusOptions = [
    { label: "Todos los estados", value: "ALL" },
    { label: "Activos", value: "ACTIVO" },
    { label: "Inactivos", value: "INACTIVO" },
  ],
  statusPlaceholder = "Filtrar por estado",
  totalCount,
  filteredCount,
  onRefresh,
  isRefreshing = false,
  onResetFilters,
  children,
  actions,
  className,
}: DataTableToolbarProps) {
  const isFiltered = Boolean(
    (searchValue && searchValue.trim().length > 0) ||
      (statusValue && statusValue !== "ALL" && statusValue !== "")
  );

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      onSearchChange?.("");
      onStatusChange?.("ALL");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {onSearchChange && (
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="w-full sm:w-64"
          />
        )}

        {onStatusChange && statusOptions.length > 0 && (
          <Select
            value={statusValue || "ALL"}
            onValueChange={(val) => onStatusChange(val ?? "ALL")}
          >
            <SelectTrigger className="w-full sm:w-44 h-9 text-xs">
              <SelectValue placeholder={statusPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {children}

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
          >
            <X className="size-3.5" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end">
        {typeof totalCount === "number" && (
          <span className="text-xs text-muted-foreground font-medium">
            {typeof filteredCount === "number" && filteredCount !== totalCount ? (
              <>
                <strong className="text-foreground">{filteredCount}</strong> de{" "}
                <strong className="text-foreground">{totalCount}</strong> registros
              </>
            ) : (
              <>
                <strong className="text-foreground">{totalCount}</strong>{" "}
                {totalCount === 1 ? "registro" : "registros"}
              </>
            )}
          </span>
        )}

        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="size-9 shrink-0 cursor-pointer"
            title="Actualizar listado"
          >
            <RotateCw
              className={cn("size-3.5", isRefreshing && "animate-spin text-primary")}
            />
          </Button>
        )}

        {actions}
      </div>
    </div>
  );
}
