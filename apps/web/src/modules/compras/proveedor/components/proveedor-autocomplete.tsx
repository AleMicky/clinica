"use client";

import * as React from "react";
import { Building2, Check, ChevronsUpDown, Loader2, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProveedores } from "../hooks/use-proveedor";
import type { ProveedorResponse } from "../types/proveedor.types";

export interface ProveedorAutocompleteProps {
  value?: number | string | null;
  onValueChange: (value: number | null, proveedor?: ProveedorResponse | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
}

export function ProveedorAutocomplete({
  value,
  onValueChange,
  placeholder = "Seleccione un proveedor...",
  disabled = false,
  error = false,
  className,
  id,
}: ProveedorAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useProveedores({
    pageSize: 150,
  });

  const proveedores = React.useMemo(() => data?.items ?? [], [data]);

  const selectedProveedor = React.useMemo(() => {
    if (!value || Number(value) <= 0) return null;
    return proveedores.find((p) => String(p.id) === String(value)) || null;
  }, [value, proveedores]);

  const filteredProveedores = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return proveedores;
    }
    const q = searchQuery.toLowerCase().trim();
    return proveedores.filter(
      (p) =>
        p.razonSocial.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        (p.nombreComercial && p.nombreComercial.toLowerCase().includes(q)) ||
        (p.nit && p.nit.toLowerCase().includes(q))
    );
  }, [proveedores, searchQuery]);

  const handleSelect = (proveedor: ProveedorResponse) => {
    onValueChange(proveedor.id, proveedor);
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
        type="button"
        id={id}
        aria-expanded={isOpen}
        disabled={disabled}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-md border bg-background px-2.5 py-1 text-xs shadow-xs transition-colors cursor-pointer",
          "focus:outline-none focus:ring-1 focus:ring-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-destructive focus:ring-destructive"
            : "border-border/60 hover:border-border",
          className
        )}
      >
          <div className="flex items-center gap-1.5 min-w-0 flex-1 text-left">
            <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
            {selectedProveedor ? (
              <span className="truncate text-foreground font-medium">
                {selectedProveedor.razonSocial}{" "}
                <span className="text-muted-foreground font-mono">({selectedProveedor.codigo})</span>
              </span>
            ) : (
              <span className="truncate text-muted-foreground">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {selectedProveedor && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClear(e as any);
                  }
                }}
                className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="Limpiar selección"
              >
                <X className="size-3" />
              </span>
            )}
            <ChevronsUpDown className="size-3 text-muted-foreground" />
          </div>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0 shadow-md border-border" align="start">
        <div className="p-2 border-b border-border/60">
          <div className="relative flex items-center">
            <Search className="absolute left-2 size-3 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar proveedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/40 text-xs pl-7 pr-2 py-1 rounded border border-border/50 focus:outline-none focus:bg-background focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center p-4 text-xs text-muted-foreground gap-2">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Cargando proveedores...</span>
            </div>
          ) : filteredProveedores.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No se encontraron proveedores.
            </div>
          ) : (
            filteredProveedores.map((p) => {
              const isSelected = selectedProveedor?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md text-xs cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] bg-muted px-1 rounded border border-border/40 shrink-0">
                        {p.codigo}
                      </span>
                      <span className="truncate">{p.razonSocial}</span>
                    </div>
                    {p.nit && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        NIT: {p.nit}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
