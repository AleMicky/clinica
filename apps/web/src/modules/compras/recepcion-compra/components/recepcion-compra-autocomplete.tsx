"use client";

import * as React from "react";
import { PackageCheck, Check, ChevronsUpDown, Loader2, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useRecepcionesCompra,
  useRecepcionCompra,
} from "../hooks/use-recepcion-compra";
import {
  EstadoRecepcionCompra,
  type RecepcionCompraResponse,
} from "../types/recepcion-compra.types";

export interface RecepcionCompraAutocompleteProps {
  value?: number | string | null;
  onValueChange: (
    value: number | null,
    recepcion?: RecepcionCompraResponse | null
  ) => void;
  proveedorId?: number | null;
  almacenId?: number | null;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  estado?: EstadoRecepcionCompra | null;
}

export function RecepcionCompraAutocomplete({
  value,
  onValueChange,
  proveedorId,
  almacenId,
  placeholder = "Seleccionar recepción de compra...",
  disabled = false,
  error = false,
  className,
  id,
  estado = EstadoRecepcionCompra.Confirmada,
}: RecepcionCompraAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useRecepcionesCompra({
    proveedorId: proveedorId ?? undefined,
    almacenId: almacenId ?? undefined,
    estado: estado ?? undefined,
    pageSize: 150,
  });

  const recepciones = React.useMemo(() => data?.items ?? [], [data]);

  const numValue = value ? Number(value) : null;
  const inList = React.useMemo(() => {
    if (!numValue || numValue <= 0) return null;
    return recepciones.find((r) => r.id === numValue) || null;
  }, [numValue, recepciones]);

  const { data: fetchedRecepcion } = useRecepcionCompra(
    numValue && !inList ? numValue : 0,
    Boolean(numValue && !inList)
  );

  const selectedRecepcion = inList || fetchedRecepcion || null;

  const filteredRecepciones = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return recepciones;
    }
    const q = searchQuery.toLowerCase().trim();
    return recepciones.filter(
      (r) =>
        r.numero.toLowerCase().includes(q) ||
        (r.proveedorRazonSocial &&
          r.proveedorRazonSocial.toLowerCase().includes(q)) ||
        (r.almacenNombre && r.almacenNombre.toLowerCase().includes(q)) ||
        (r.numeroFactura && r.numeroFactura.toLowerCase().includes(q)) ||
        (r.observacion && r.observacion.toLowerCase().includes(q))
    );
  }, [recepciones, searchQuery]);

  const handleSelect = (recepcion: RecepcionCompraResponse) => {
    onValueChange(recepcion.id, recepcion);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onValueChange(null, null);
    setSearchQuery("");
  };

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        className={cn(
          "w-full h-8 px-2.5 flex items-center justify-between gap-1.5 text-xs rounded-md border bg-background text-left transition-all cursor-pointer shadow-2xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
          error
            ? "border-destructive focus-visible:ring-destructive"
            : "border-input hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <PackageCheck
            className={cn(
              "size-3.5 shrink-0",
              selectedRecepcion
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            )}
          />
          {selectedRecepcion ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
              <span className="font-mono font-bold text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded shrink-0">
                {selectedRecepcion.numero}
              </span>
              {selectedRecepcion.proveedorRazonSocial && (
                <span className="font-medium text-foreground truncate text-xs">
                  {selectedRecepcion.proveedorRazonSocial}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground truncate text-xs">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0 text-muted-foreground ml-1">
          {isLoading ? (
            <Loader2 className="size-3 animate-spin text-primary" />
          ) : selectedRecepcion && !disabled ? (
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
        className="w-[300px] sm:w-[400px] p-1.5 max-h-80 overflow-hidden flex flex-col rounded-xl shadow-xl border-border/80 z-50"
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
              if (e.key === "Enter" && filteredRecepciones.length > 0) {
                e.preventDefault();
                handleSelect(filteredRecepciones[0]);
              }
            }}
            placeholder="Buscar por número, proveedor o almacén..."
            className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/70"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Results list */}
        <div className="overflow-y-auto max-h-56 pr-0.5 space-y-0.5">
          {isLoading && filteredRecepciones.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Cargando recepciones de compra...</span>
            </div>
          ) : filteredRecepciones.length === 0 ? (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              No se encontraron recepciones confirmadas.
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filteredRecepciones.map((recepcion) => {
                const isSelected = selectedRecepcion?.id === recepcion.id;

                return (
                  <li
                    key={recepcion.id}
                    onClick={() => handleSelect(recepcion)}
                    className={cn(
                      "flex cursor-pointer select-none items-center justify-between rounded-lg px-2 py-1.5 outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors text-xs",
                      isSelected && "bg-accent/80 font-medium text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="size-5 rounded flex items-center justify-center shrink-0 border bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        <PackageCheck className="size-3" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-[10px] text-foreground bg-muted px-1 py-0.2 rounded shrink-0">
                            {recepcion.numero}
                          </span>
                          {recepcion.proveedorRazonSocial && (
                            <span className="truncate font-medium text-xs">
                              {recepcion.proveedorRazonSocial}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          {recepcion.almacenNombre && (
                            <span>Almacén: {recepcion.almacenNombre}</span>
                          )}
                          <span>•</span>
                          <span>
                            {new Date(recepcion.fechaRecepcion).toLocaleDateString()}
                          </span>
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
      </PopoverContent>
    </Popover>
  );
}
