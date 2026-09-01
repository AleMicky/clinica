"use client";

import * as React from "react";
import { ArrowDownLeft, ArrowUpRight, Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTiposMovimientoInventario } from "../hooks/use-tipo-movimiento-inventario";
import {
  NaturalezaMovimiento,
  type TipoMovimientoInventarioResponse,
} from "../types/tipo-movimiento-inventario.types";

export interface TipoMovimientoInventarioAutocompleteProps {
  value?: number | string | null;
  onValueChange: (value: number | null, tipo?: TipoMovimientoInventarioResponse | null) => void;
  naturaleza?: NaturalezaMovimiento;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
}

export function TipoMovimientoInventarioAutocomplete({
  value,
  onValueChange,
  naturaleza,
  placeholder = "Seleccione un tipo de movimiento...",
  disabled = false,
  error = false,
  className,
  id,
}: TipoMovimientoInventarioAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useTiposMovimientoInventario({
    naturaleza,
    pageSize: 150,
  });

  const tipos = React.useMemo(() => data?.items ?? [], [data]);

  const selectedTipo = React.useMemo(() => {
    if (!value || Number(value) <= 0) return null;
    return tipos.find((t) => String(t.id) === String(value)) || null;
  }, [value, tipos]);

  // Synchronize text with selected item
  React.useEffect(() => {
    if (selectedTipo) {
      setQuery(`${selectedTipo.codigo} - ${selectedTipo.nombre}`);
    } else if (!value || Number(value) <= 0) {
      setQuery("");
    }
  }, [selectedTipo, value]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!isOpen) return;
        setIsOpen(false);

        if (selectedTipo) {
          setQuery(`${selectedTipo.codigo} - ${selectedTipo.nombre}`);
        } else {
          setQuery("");
          if (value) onValueChange(null, null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, selectedTipo, value, onValueChange]);

  const filteredTipos = React.useMemo(() => {
    if (
      !query.trim() ||
      (selectedTipo && query === `${selectedTipo.codigo} - ${selectedTipo.nombre}`)
    ) {
      return tipos;
    }
    const q = query.toLowerCase().trim();
    return tipos.filter(
      (t) =>
        t.nombre.toLowerCase().includes(q) ||
        t.codigo.toLowerCase().includes(q) ||
        (t.descripcion && t.descripcion.toLowerCase().includes(q))
    );
  }, [tipos, query, selectedTipo]);

  const handleSelect = (tipo: TipoMovimientoInventarioResponse) => {
    setQuery(`${tipo.codigo} - ${tipo.nombre}`);
    onValueChange(tipo.id, tipo);
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
              if (filteredTipos.length > 0) {
                e.preventDefault();
                handleSelect(filteredTipos[0]);
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
          {isLoading && filteredTipos.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin text-primary" />
              <span>Cargando tipos de movimiento...</span>
            </div>
          ) : filteredTipos.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
              No se encontraron tipos de movimiento.
            </div>
          ) : (
            <ul className="p-1 text-xs">
              {filteredTipos.map((tipo) => {
                const isSelected = selectedTipo?.id === tipo.id;
                const isEntrada = tipo.naturaleza === NaturalezaMovimiento.Entrada;

                return (
                  <li
                    key={tipo.id}
                    onClick={() => handleSelect(tipo)}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1 outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors",
                      isSelected && "bg-accent/60 font-medium text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={cn(
                          "size-4.5 rounded flex items-center justify-center text-[9px] shrink-0 border",
                          isEntrada
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {isEntrada ? (
                          <ArrowDownLeft className="size-2.5" />
                        ) : (
                          <ArrowUpRight className="size-2.5" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-semibold text-[9px] text-foreground bg-muted px-1 rounded">
                            {tipo.codigo}
                          </span>
                          <span className="truncate text-xs">{tipo.nombre}</span>
                        </div>
                        {tipo.descripcion && (
                          <span className="text-[9px] text-muted-foreground truncate max-w-xs">
                            {tipo.descripcion}
                          </span>
                        )}
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
