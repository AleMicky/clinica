"use client";

import * as React from "react";
import { FileSpreadsheet, Check, ChevronsUpDown, Loader2, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useCotizacionesCompra,
  useCotizacionCompra,
} from "../hooks/use-cotizacion-compra";
import {
  EstadoCotizacionCompra,
  type CotizacionCompraResponse,
} from "../types/cotizacion-compra.types";

export interface CotizacionCompraAutocompleteProps {
  value?: number | string | null;
  onValueChange: (
    value: number | null,
    cotizacion?: CotizacionCompraResponse | null
  ) => void;
  proveedorId?: number | null;
  solicitudCompraId?: number | null;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  estado?: EstadoCotizacionCompra | null;
}

export function CotizacionCompraAutocomplete({
  value,
  onValueChange,
  proveedorId,
  solicitudCompraId,
  placeholder = "Seleccionar cotización...",
  disabled = false,
  error = false,
  className,
  id,
  estado = EstadoCotizacionCompra.Seleccionada,
}: CotizacionCompraAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useCotizacionesCompra({
    proveedorId: proveedorId ?? undefined,
    solicitudCompraId: solicitudCompraId ?? undefined,
    estado: estado ?? undefined,
    pageSize: 150,
  });

  const cotizaciones = React.useMemo(() => data?.items ?? [], [data]);

  const numValue = value ? Number(value) : null;
  const inList = React.useMemo(() => {
    if (!numValue || numValue <= 0) return null;
    return cotizaciones.find((c) => c.id === numValue) || null;
  }, [numValue, cotizaciones]);

  const { data: fetchedCotizacion } = useCotizacionCompra(
    numValue && !inList ? numValue : 0,
    Boolean(numValue && !inList)
  );

  const selectedCotizacion = inList || fetchedCotizacion || null;

  const filteredCotizaciones = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return cotizaciones;
    }
    const q = searchQuery.toLowerCase().trim();
    return cotizaciones.filter(
      (c) =>
        c.numero.toLowerCase().includes(q) ||
        (c.proveedorRazonSocial &&
          c.proveedorRazonSocial.toLowerCase().includes(q)) ||
        (c.observacion && c.observacion.toLowerCase().includes(q))
    );
  }, [cotizaciones, searchQuery]);

  const handleSelect = (cotizacion: CotizacionCompraResponse) => {
    onValueChange(cotizacion.id, cotizacion);
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
          <FileSpreadsheet
            className={cn(
              "size-3.5 shrink-0",
              selectedCotizacion
                ? "text-teal-600 dark:text-teal-400"
                : "text-muted-foreground"
            )}
          />
          {selectedCotizacion ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
              <span className="font-mono font-bold text-[10px] text-teal-700 dark:text-teal-300 bg-teal-500/10 px-1 py-0.5 rounded shrink-0">
                {selectedCotizacion.numero}
              </span>
              {selectedCotizacion.proveedorRazonSocial && (
                <span className="font-medium text-foreground truncate text-xs">
                  {selectedCotizacion.proveedorRazonSocial}
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
          ) : selectedCotizacion && !disabled ? (
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
        className="w-[300px] sm:w-[380px] p-1.5 max-h-80 overflow-hidden flex flex-col rounded-xl shadow-xl border-border/80 z-50"
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
              if (e.key === "Enter" && filteredCotizaciones.length > 0) {
                e.preventDefault();
                handleSelect(filteredCotizaciones[0]);
              }
            }}
            placeholder="Buscar por número o proveedor..."
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
          {isLoading && filteredCotizaciones.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Cargando cotizaciones...</span>
            </div>
          ) : filteredCotizaciones.length === 0 ? (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              No se encontraron cotizaciones de compra.
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filteredCotizaciones.map((cotizacion) => {
                const isSelected = selectedCotizacion?.id === cotizacion.id;

                return (
                  <li
                    key={cotizacion.id}
                    onClick={() => handleSelect(cotizacion)}
                    className={cn(
                      "flex cursor-pointer select-none items-center justify-between rounded-lg px-2 py-1.5 outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors text-xs",
                      isSelected && "bg-accent/80 font-medium text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="size-5 rounded flex items-center justify-center shrink-0 border bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400">
                        <FileSpreadsheet className="size-3" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-[10px] text-foreground bg-muted px-1 py-0.2 rounded shrink-0">
                            {cotizacion.numero}
                          </span>
                          {cotizacion.proveedorRazonSocial && (
                            <span className="truncate font-medium text-xs">
                              {cotizacion.proveedorRazonSocial}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>
                            {new Date(cotizacion.fecha).toLocaleDateString()}
                          </span>
                          {cotizacion.total > 0 && (
                            <span className="font-mono font-semibold text-foreground">
                              Total: ${Number(cotizacion.total).toFixed(2)}
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
      </PopoverContent>
    </Popover>
  );
}
