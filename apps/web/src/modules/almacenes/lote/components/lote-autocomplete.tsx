"use client";

import * as React from "react";
import { Layers, Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLotes } from "../hooks/use-lote";
import type { LoteResponse } from "../types/lote.types";

export interface LoteAutocompleteProps {
  productoId?: number | null;
  value?: number | string | null;
  onValueChange: (value: number | null, lote?: LoteResponse | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
}

export function LoteAutocomplete({
  productoId,
  value,
  onValueChange,
  placeholder = "Seleccionar lote...",
  disabled = false,
  error = false,
  className,
  id,
}: LoteAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useLotes(
    {
      productoId: productoId && productoId > 0 ? productoId : undefined,
      pageSize: 100,
    },
    {
      enabled: Boolean(productoId && productoId > 0),
    }
  );

  const lotes = React.useMemo(() => data?.items ?? [], [data]);

  const selectedLote = React.useMemo(() => {
    if (!value || Number(value) <= 0) return null;
    return lotes.find((l) => String(l.id) === String(value)) || null;
  }, [value, lotes]);

  // Synchronize text with selected lote
  React.useEffect(() => {
    if (selectedLote) {
      setQuery(selectedLote.numeroLote);
    } else if (!value || Number(value) <= 0) {
      setQuery("");
    }
  }, [selectedLote, value]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (!isOpen) return;
        setIsOpen(false);

        if (selectedLote) {
          setQuery(selectedLote.numeroLote);
        } else {
          setQuery("");
          if (value) onValueChange(null, null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, selectedLote, value, onValueChange]);

  const filteredLotes = React.useMemo(() => {
    if (!query.trim() || (selectedLote && query === selectedLote.numeroLote)) {
      return lotes;
    }
    const q = query.toLowerCase().trim();
    return lotes.filter((l) => l.numeroLote.toLowerCase().includes(q));
  }, [lotes, query, selectedLote]);

  const handleSelect = (lote: LoteResponse) => {
    setQuery(lote.numeroLote);
    onValueChange(lote.id, lote);
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

  const isDisabled = disabled || !productoId || productoId <= 0;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          disabled={isDisabled}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (!e.target.value && value) {
              onValueChange(null, null);
            }
          }}
          onFocus={() => {
            if (!isDisabled) {
              setIsOpen(true);
            }
          }}
          placeholder={
            !productoId
              ? "Seleccione producto..."
              : placeholder
          }
          className={cn(
            "flex h-7.5 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-2xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-12 pl-6.5 font-mono",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
        <Layers className="absolute left-1.5 top-2 size-3.5 text-muted-foreground pointer-events-none" />

        <div className="absolute right-1 top-1 flex items-center gap-0.5">
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <>
              {value && !isDisabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  <X className="size-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!isDisabled) {
                    setIsOpen(!isOpen);
                    inputRef.current?.focus();
                  }
                }}
                disabled={isDisabled}
                className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:cursor-not-allowed"
                tabIndex={-1}
              >
                <ChevronsUpDown className="size-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {isOpen && !isDisabled && (
        <div className="absolute z-50 mt-1 max-h-56 w-full min-w-[200px] overflow-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          {isLoading ? (
            <div className="flex items-center justify-center p-4 text-xs text-muted-foreground gap-2">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Cargando lotes...</span>
            </div>
          ) : filteredLotes.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              {lotes.length === 0
                ? "Este producto no tiene lotes registrados."
                : "No se encontraron lotes."}
            </div>
          ) : (
            filteredLotes.map((lote) => {
              const isSelected = String(lote.id) === String(value);
              const expDate = lote.fechaVencimiento
                ? new Date(lote.fechaVencimiento).toLocaleDateString("es-ES", {
                    month: "2-digit",
                    year: "2-digit",
                  })
                : null;

              return (
                <div
                  key={lote.id}
                  onClick={() => handleSelect(lote)}
                  className={cn(
                    "flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs cursor-pointer select-none transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent/50 font-medium"
                  )}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono font-semibold text-foreground">
                      {lote.numeroLote}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {expDate && <span>Vence: {expDate}</span>}
                      {lote.costoUnitario !== null &&
                        lote.costoUnitario !== undefined && (
                          <span>Costo: Bs. {Number(lote.costoUnitario).toFixed(2)}</span>
                        )}
                    </div>
                  </div>
                  {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
