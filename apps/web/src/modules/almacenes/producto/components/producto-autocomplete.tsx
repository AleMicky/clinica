"use client";

import * as React from "react";
import { Package, Check, ChevronsUpDown, Loader2, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProductos, useProducto } from "../hooks/use-producto";
import type { ProductoResponse } from "../types/producto.types";

export interface ProductoAutocompleteProps {
  value?: number | string | null;
  onValueChange: (value: number | null, producto?: ProductoResponse | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
}

function normalizeText(value?: string | null): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function ProductoAutocomplete({
  value,
  onValueChange,
  placeholder = "Seleccione un producto...",
  disabled = false,
  error = false,
  className,
  id,
}: ProductoAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Debounce search query to search across the entire database
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus search input when popover opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Load all items (up to 10000), and query server with search parameter
  const { data, isLoading, isFetching } = useProductos({
    pageSize: 10000,
    search: debouncedSearch || undefined,
  });

  const productos = React.useMemo(() => data?.items ?? [], [data]);

  const numericValue = Number(value) || 0;
  const isValueInList = Boolean(
    numericValue > 0 && productos.some((p) => p.id === numericValue)
  );

  // Fallback single product fetch if the selected ID is not currently in the loaded list
  const { data: fallbackProducto } = useProducto(
    !isValueInList && numericValue > 0 ? numericValue : 0
  );

  const selectedProducto = React.useMemo(() => {
    if (!value || numericValue <= 0) return null;
    const inList = productos.find((p) => p.id === numericValue);
    if (inList) return inList;
    if (fallbackProducto && fallbackProducto.id === numericValue) {
      return fallbackProducto;
    }
    return null;
  }, [value, numericValue, productos, fallbackProducto]);

  // Multi-word accent-insensitive client-side filter for instant response while typing
  const filteredProductos = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return productos;
    }
    const words = normalizeText(searchQuery).split(/\s+/).filter(Boolean);
    return productos.filter((p) => {
      const target = normalizeText(
        `${p.codigo} ${p.nombre} ${p.descripcion || ""} ${p.categoriaProductoNombre || ""} ${p.marcaNombre || ""} ${p.proveedorRazonSocial || ""} ${p.unidadMedidaSimbolo || ""}`
      );
      return words.every((w) => target.includes(w));
    });
  }, [productos, searchQuery]);

  const handleSelect = (producto: ProductoResponse) => {
    onValueChange(producto.id, producto);
    setIsOpen(false);
    setSearchQuery("");
    setDebouncedSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onValueChange(null, null);
    setSearchQuery("");
    setDebouncedSearch("");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
      setDebouncedSearch("");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        className={cn(
          "w-full h-7.5 px-2 flex items-center justify-between gap-1.5 text-xs rounded-md border bg-background text-left transition-all cursor-pointer shadow-2xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
          error
            ? "border-destructive focus-visible:ring-destructive"
            : "border-input hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Package
            className={cn(
              "size-3 shrink-0",
              selectedProducto
                ? "text-violet-600 dark:text-violet-400"
                : "text-muted-foreground"
            )}
          />
          {selectedProducto ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
              <span className="font-mono font-bold text-[10px] text-violet-700 dark:text-violet-300 bg-violet-500/10 px-1 py-0.5 rounded shrink-0">
                {selectedProducto.codigo}
              </span>
              <span className="font-medium text-foreground truncate text-xs">
                {selectedProducto.nombre}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground truncate text-xs">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0 text-muted-foreground ml-1">
          {isLoading && !data ? (
            <Loader2 className="size-3 animate-spin text-primary" />
          ) : selectedProducto && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear(e as any);
                }
              }}
              className="rounded-full p-0.5 hover:bg-muted hover:text-foreground transition-colors cursor-pointer inline-flex items-center justify-center"
              title="Quitar selección"
            >
              <X className="size-3" />
            </span>
          ) : (
            <ChevronsUpDown className="size-3 opacity-60" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[340px] sm:w-[440px] p-1.5 max-h-96 overflow-hidden flex flex-col rounded-xl shadow-xl border-border/80 z-50"
      >
        {/* Search header */}
        <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border/50 bg-muted/20 rounded-md mb-1">
          <Search className="size-3.5 text-muted-foreground shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredProductos.length > 0) {
                e.preventDefault();
                handleSelect(filteredProductos[0]);
              }
            }}
            placeholder="Buscar por código, nombre, categoría o marca..."
            className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/70"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Results list */}
        <div className="overflow-y-auto max-h-64 pr-0.5 space-y-0.5">
          {isLoading && !data ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Cargando productos...</span>
            </div>
          ) : filteredProductos.length === 0 ? (
            <div className="px-3 py-6 text-xs text-muted-foreground text-center">
              No se encontraron productos coincidentes.
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filteredProductos.map((prod) => {
                const isSelected = selectedProducto?.id === prod.id;

                return (
                  <li
                    key={prod.id}
                    onClick={() => handleSelect(prod)}
                    className={cn(
                      "flex cursor-pointer select-none items-center justify-between rounded-lg px-2 py-1.5 outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors text-xs",
                      isSelected && "bg-accent/80 font-medium text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="size-5 rounded flex items-center justify-center shrink-0 border bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400">
                        <Package className="size-3" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-[10px] text-foreground bg-muted px-1 py-0.2 rounded shrink-0">
                            {prod.codigo}
                          </span>
                          <span className="truncate font-medium text-xs">{prod.nombre}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          {prod.categoriaProductoNombre && (
                            <span className="truncate">{prod.categoriaProductoNombre}</span>
                          )}
                          {prod.marcaNombre && (
                            <span className="truncate text-muted-foreground/75">• {prod.marcaNombre}</span>
                          )}
                          {prod.unidadMedidaSimbolo && (
                            <span className="font-mono bg-muted/70 px-1 rounded text-[9px]">
                              {prod.unidadMedidaSimbolo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="size-3.5 text-primary ml-1.5 shrink-0" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer info & count */}
        <div className="flex items-center justify-between px-2 pt-1.5 mt-1 border-t border-border/40 text-[10px] text-muted-foreground">
          <span>
            {isFetching ? (
              <span className="inline-flex items-center gap-1 text-primary">
                <Loader2 className="size-2.5 animate-spin" />
                Buscando...
              </span>
            ) : (
              `Mostrando ${filteredProductos.length} ${
                data?.totalItems && data.totalItems > filteredProductos.length
                  ? `de ${data.totalItems}`
                  : ""
              } producto${filteredProductos.length === 1 ? "" : "s"}`
            )}
          </span>
          {data?.totalItems && data.totalItems > 10000 && !searchQuery && (
            <span className="text-muted-foreground">Escriba para filtrar</span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
