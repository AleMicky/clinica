"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DataTablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  itemLabel?: string;
}

export function DataTablePagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  isLoading = false,
  itemLabel = "registros",
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toItem = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/50 text-sm w-full">
      {/* Información de Registros */}
      <div className="text-xs text-muted-foreground">
        Mostrando <span className="font-semibold text-foreground">{fromItem}</span> a{" "}
        <span className="font-semibold text-foreground">{toItem}</span> de{" "}
        <span className="font-semibold text-foreground">{totalItems}</span> {itemLabel}
      </div>

      {/* Selector de Filas por Página y Botones de Navegación */}
      <div className="flex flex-wrap items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filas por página</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-16 text-xs">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2 font-medium">
            Página {currentPage} de {totalPages}
          </span>

          {/* Primera Página */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronsLeft className="size-4" />
            <span className="sr-only">Primera página</span>
          </Button>

          {/* Página Anterior */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Página anterior</span>
          </Button>

          {/* Página Siguiente */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || isLoading}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Página siguiente</span>
          </Button>

          {/* Última Página */}
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages || isLoading}
          >
            <ChevronsRight className="size-4" />
            <span className="sr-only">Última página</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
