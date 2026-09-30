"use client";

import * as React from "react";
import { Tag, Check, ChevronsUpDown, Loader2, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMarcas } from "../hooks/use-marca";
import type { MarcaResponse } from "../types/marca.types";

export interface MarcaAutocompleteProps {
  value?: number | string | null;
  onValueChange: (value: number | null, marca?: MarcaResponse | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
}

export function MarcaAutocomplete({
  value,
  onValueChange,
  placeholder = "Seleccione una marca...",
  disabled = false,
  error = false,
  className,
  id,
}: MarcaAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useMarcas({
    pageSize: 150,
  });

  const marcas = React.useMemo(() => data?.items ?? [], [data]);

  const selectedMarca = React.useMemo(() => {
    if (!value || Number(value) <= 0) return null;
    return marcas.find((m) => String(m.id) === String(value)) || null;
  }, [value, marcas]);

  const filteredMarcas = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return marcas;
    }
    const q = searchQuery.toLowerCase().trim();
    return marcas.filter(
      (m) =>
        m.nombre.toLowerCase().includes(q) ||
        m.codigo.toLowerCase().includes(q)
    );
  }, [marcas, searchQuery]);

  const handleSelect = (marca: MarcaResponse) => {
    onValueChange(marca.id, marca);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onValueChange(null, null);
    setSearchQuery("");
  };

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
          <Tag
            className={cn(
              "size-3.5 shrink-0",
              selectedMarca
                ? "text-primary"
                : "text-muted-foreground"
            )}
          />
          {selectedMarca ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
              <span className="font-mono font-bold text-[10px] text-primary bg-primary/10 px-1 py-0.5 rounded shrink-0">
                {selectedMarca.codigo}
              </span>
              <span className="font-medium text-foreground truncate text-xs">
                {selectedMarca.nombre}
              </span>
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
          ) : selectedMarca && !disabled ? (
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
              if (e.key === "Enter" && filteredMarcas.length > 0) {
                e.preventDefault();
                handleSelect(filteredMarcas[0]);
              }
            }}
            placeholder="Buscar por código o nombre..."
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
          {isLoading && filteredMarcas.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Cargando marcas...</span>
            </div>
          ) : filteredMarcas.length === 0 ? (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              No se encontraron marcas coincidentes.
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filteredMarcas.map((marca) => {
                const isSelected = selectedMarca?.id === marca.id;

                return (
                  <li
                    key={marca.id}
                    onClick={() => handleSelect(marca)}
                    className={cn(
                      "flex cursor-pointer select-none items-center justify-between rounded-lg px-2 py-1.5 outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors text-xs",
                      isSelected && "bg-accent/80 font-medium text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="size-5 rounded flex items-center justify-center shrink-0 border bg-primary/10 border-primary/30 text-primary">
                        <Tag className="size-3" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-[10px] text-foreground bg-muted px-1 py-0.2 rounded shrink-0">
                            {marca.codigo}
                          </span>
                          <span className="truncate font-medium text-xs">{marca.nombre}</span>
                        </div>
                        {marca.descripcion && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {marca.descripcion}
                          </span>
                        )}
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
