"use client";

import * as React from "react";
import { Package, Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductos } from "../hooks/use-producto";
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
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useProductos({
    pageSize: 200,
  });

  const productos = React.useMemo(() => data?.items ?? [], [data]);

  const selectedProducto = React.useMemo(() => {
    if (!value || Number(value) <= 0) return null;
    return productos.find((p) => String(p.id) === String(value)) || null;
  }, [value, productos]);

  // Synchronize text with selected product
  React.useEffect(() => {
    if (selectedProducto) {
      setQuery(`${selectedProducto.codigo} - ${selectedProducto.nombre}`);
    } else if (!value || Number(value) <= 0) {
      setQuery("");
    }
  }, [selectedProducto, value]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!isOpen) return;
        setIsOpen(false);

        if (selectedProducto) {
          setQuery(`${selectedProducto.codigo} - ${selectedProducto.nombre}`);
        } else {
          setQuery("");
          if (value) onValueChange(null, null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, selectedProducto, value, onValueChange]);

  const filteredProductos = React.useMemo(() => {
    if (
      !query.trim() ||
      (selectedProducto && query === `${selectedProducto.codigo} - ${selectedProducto.nombre}`)
    ) {
      return productos;
    }
    const q = query.toLowerCase().trim();
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        (p.categoriaProductoNombre &&
          p.categoriaProductoNombre.toLowerCase().includes(q))
    );
  }, [productos, query, selectedProducto]);

  const handleSelect = (producto: ProductoResponse) => {
    setQuery(`${producto.codigo} - ${producto.nombre}`);
    onValueChange(producto.id, producto);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuery("");
    onValueChange(null, null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            } else if (e.key === "Enter" && isOpen) {
              if (filteredProductos.length > 0) {
                e.preventDefault();
                handleSelect(filteredProductos[0]);
              }
            }
          }}
          className={cn(
            "flex h-7.5 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-2xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-6.5",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
        />

        <div className="absolute right-1.5 flex items-center text-muted-foreground">
          {isLoading ? (
            <Loader2 className="size-3 animate-spin text-primary" />
          ) : query && !disabled ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              className="rounded-full p-0.5 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-2.5" />
              <span className="sr-only">Limpiar</span>
            </button>
          ) : (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setIsOpen((prev) => !prev)}
              className="p-0.5 hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronsUpDown className="size-3" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-52 min-w-full w-max max-w-md overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
          {isLoading && filteredProductos.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin text-primary" />
              <span>Cargando productos...</span>
            </div>
          ) : filteredProductos.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
              No se encontraron productos.
            </div>
          ) : (
            <ul className="p-1 text-xs">
              {filteredProductos.map((prod) => {
                const isSelected = selectedProducto?.id === prod.id;

                return (
                  <li
                    key={prod.id}
                    onClick={() => handleSelect(prod)}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1 outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors",
                      isSelected && "bg-accent/60 font-medium text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="size-4.5 rounded flex items-center justify-center text-[9px] shrink-0 border bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400">
                        <Package className="size-2.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-semibold text-[9px] text-foreground bg-muted px-1 rounded">
                            {prod.codigo}
                          </span>
                          <span className="truncate text-xs">{prod.nombre}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                          {prod.categoriaProductoNombre && (
                            <span>{prod.categoriaProductoNombre}</span>
                          )}
                          {prod.unidadMedidaSimbolo && (
                            <span className="font-mono bg-muted/60 px-1 rounded">
                              {prod.unidadMedidaSimbolo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="size-3 text-primary ml-1.5 shrink-0" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
