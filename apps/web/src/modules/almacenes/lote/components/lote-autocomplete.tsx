"use client";

import * as React from "react";
import { Layers, Check, ChevronsUpDown, Loader2, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLotes } from "../hooks/use-lote";
import { useExistencias } from "../../existencia/hooks/use-existencia";
import type { LoteResponse } from "../types/lote.types";

export interface LoteAutocompleteProps {
  productoId?: number | null;
  almacenId?: number | null;
  value?: number | string | null;
  onValueChange: (value: number | null, lote?: LoteResponse | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  showStock?: boolean;
  className?: string;
  id?: string;
}

export function LoteAutocomplete({
  productoId,
  almacenId,
  value,
  onValueChange,
  placeholder = "Seleccionar lote...",
  disabled = false,
  error = false,
  showStock = true,
  className,
  id,
}: LoteAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useLotes(
    {
      productoId: productoId && productoId > 0 ? productoId : undefined,
      pageSize: 100,
    },
    {
      enabled: Boolean(productoId && productoId > 0),
    }
  );

  const { data: existenciasData } = useExistencias(
    productoId && productoId > 0
      ? {
          productoId,
          almacenId: almacenId && almacenId > 0 ? almacenId : undefined,
          pageSize: 100,
        }
      : undefined
  );

  const existenciasPorLote = React.useMemo(() => {
    const map = new Map<number, { cantidad: number; disponible: number; reservada: number }>();
    if (!existenciasData?.items) return map;

    for (const ex of existenciasData.items) {
      if (ex.loteId) {
        const current = map.get(ex.loteId) || { cantidad: 0, disponible: 0, reservada: 0 };
        map.set(ex.loteId, {
          cantidad: current.cantidad + ex.cantidad,
          disponible: current.disponible + ex.cantidadDisponible,
          reservada: current.reservada + ex.cantidadReservada,
        });
      }
    }
    return map;
  }, [existenciasData]);

  const lotes = React.useMemo(() => data?.items ?? [], [data]);

  const selectedLote = React.useMemo(() => {
    if (!value || Number(value) <= 0) return null;
    return lotes.find((l) => String(l.id) === String(value)) || null;
  }, [value, lotes]);

  const filteredLotes = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return lotes;
    }
    const q = searchQuery.toLowerCase().trim();
    return lotes.filter((l) => l.numeroLote.toLowerCase().includes(q));
  }, [lotes, searchQuery]);

  const handleSelect = (lote: LoteResponse | null) => {
    if (!lote) {
      onValueChange(null, null);
    } else {
      onValueChange(lote.id, lote);
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onValueChange(null, null);
    setSearchQuery("");
  };

  const isDisabled = disabled || !productoId || productoId <= 0;

  return (
    <Popover open={isOpen && !isDisabled} onOpenChange={(open) => !isDisabled && setIsOpen(open)}>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={isDisabled}
        aria-expanded={isOpen}
        className={cn(
          "w-full h-7.5 px-2 flex items-center justify-between gap-1 text-xs rounded-md border bg-background text-left transition-all font-mono",
          isDisabled
            ? "opacity-50 cursor-not-allowed bg-muted/20 border-border/50 text-muted-foreground"
            : "cursor-pointer shadow-2xs hover:border-primary/50",
          error
            ? "border-destructive focus-visible:ring-destructive"
            : "border-input",
          className
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Layers
            className={cn(
              "size-3 shrink-0",
              selectedLote
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            )}
          />
          {selectedLote ? (
            <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
              <span className="font-bold text-[10px] text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1 py-0.5 rounded truncate">
                {selectedLote.numeroLote}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground truncate text-[11px] font-sans">
              {!productoId ? "Elige producto" : placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0 text-muted-foreground ml-1">
          {isLoading ? (
            <Loader2 className="size-3 animate-spin text-primary" />
          ) : selectedLote && !isDisabled ? (
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
              title="Quitar lote"
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
        className="w-[260px] sm:w-[320px] p-1.5 max-h-72 overflow-hidden flex flex-col rounded-xl shadow-xl border-border/80 z-50"
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
              if (e.key === "Enter" && filteredLotes.length > 0) {
                e.preventDefault();
                handleSelect(filteredLotes[0]);
              }
            }}
            placeholder="Buscar por n° de lote..."
            className="w-full text-xs font-mono bg-transparent outline-none placeholder:text-muted-foreground/70"
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
        <div className="overflow-y-auto max-h-48 pr-0.5 space-y-0.5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Cargando lotes...</span>
            </div>
          ) : filteredLotes.length === 0 ? (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              {lotes.length === 0
                ? "Este producto no tiene lotes registrados."
                : "No se encontraron lotes coincidentes."}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filteredLotes.map((lote) => {
                const isSelected = String(lote.id) === String(value);
                const expDate = lote.fechaVencimiento
                  ? new Date(lote.fechaVencimiento).toLocaleDateString("es-ES", {
                      month: "2-digit",
                      year: "2-digit",
                    })
                  : null;

                const loteStock = existenciasPorLote.get(lote.id);

                return (
                  <li
                    key={lote.id}
                    onClick={() => handleSelect(lote)}
                    className={cn(
                      "flex cursor-pointer select-none items-center justify-between rounded-lg px-2 py-1.5 outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors text-xs",
                      isSelected && "bg-accent/80 font-medium text-accent-foreground"
                    )}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-foreground text-xs">
                          {lote.numeroLote}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                        {expDate && <span>Vence: {expDate}</span>}
                        {lote.costoUnitario !== null &&
                          lote.costoUnitario !== undefined && (
                            <span>Costo: Bs. {Number(lote.costoUnitario).toFixed(2)}</span>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {showStock && loteStock !== undefined && (
                        <span
                          className={cn(
                            "font-mono text-[10px] px-1.5 py-0.5 rounded font-bold border",
                            loteStock.disponible > 0
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : "bg-muted text-muted-foreground border-border/50"
                          )}
                          title={`Físico: ${loteStock.cantidad} | Reservado: ${loteStock.reservada} | Disponible: ${loteStock.disponible}`}
                        >
                          Disp: {loteStock.disponible.toLocaleString()}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="size-3.5 text-primary ml-1 shrink-0" />
                      )}
                    </div>
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
