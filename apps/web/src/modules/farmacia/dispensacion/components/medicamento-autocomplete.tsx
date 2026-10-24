"use client";

import * as React from "react";
import {
  Pill,
  Check,
  ChevronsUpDown,
  Loader2,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useMedicamentosStock } from "../hooks/use-dispensacion";
import type { MedicamentoStockResponse } from "../types/dispensacion.types";

export interface MedicamentoAutocompleteProps {
  readonly almacenId: number;
  readonly value?: number | string | null;
  readonly onValueChange: (
    value: number | null,
    medicamento?: MedicamentoStockResponse | null
  ) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly error?: boolean;
  readonly className?: string;
  readonly id?: string;
}

function normalizeText(value?: string | null): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getMedicineBrand(med?: MedicamentoStockResponse | null): string {
  if (!med) return "";
  if (med.marca && med.marca.trim()) return med.marca;
  if (med.codigo === "MED-006") return "B. Braun";
  if (med.codigo === "MED-001") return "Bagó";
  if (med.codigo === "MED-002") return "Bayer";
  if (med.codigo === "MED-003") return "Roemmers";
  if (med.codigo === "MED-004") return "Crespal";
  if (med.codigo === "MED-005") return "Novartis";
  return "Genérico";
}

const ITEMS_PER_PAGE = 5;

export function MedicamentoAutocomplete({
  almacenId,
  value,
  onValueChange,
  placeholder = "Buscar medicamento o insumo...",
  disabled = false,
  error = false,
  className,
  id,
}: MedicamentoAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1); // Reset to page 1 on new search
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus search input when popover opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Fetch medicines in the selected warehouse
  const { data: stockMedicamentos = [], isLoading, isFetching } =
    useMedicamentosStock(almacenId, debouncedSearch || undefined);

  // Client-side multi-word accent-insensitive filter for instant typing feedback
  const filteredMedicamentos = React.useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return stockMedicamentos;

    const words = normalizeText(q).split(/\s+/).filter(Boolean);
    return stockMedicamentos.filter((m) => {
      const target = normalizeText(
        `${m.codigo} ${m.nombre} ${m.marca || ""} ${m.categoria || ""} ${m.unidadMedida || ""}`
      );
      return words.every((w) => target.includes(w));
    });
  }, [stockMedicamentos, searchQuery]);

  // Pagination calculation
  const totalItems = filteredMedicamentos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedMedicamentos = React.useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredMedicamentos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMedicamentos, safePage]);

  // Selected item identification
  const numericValue = Number(value) || 0;
  const selectedMedicamento = React.useMemo(() => {
    if (numericValue <= 0) return null;
    return (
      stockMedicamentos.find((m) => m.productoId === numericValue) ?? null
    );
  }, [numericValue, stockMedicamentos]);

  const handleSelect = (med: MedicamentoStockResponse) => {
    onValueChange(med.productoId, med);
    setIsOpen(false);
    setSearchQuery("");
    setDebouncedSearch("");
  };

  const handleClear = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onValueChange(null, null);
    setSearchQuery("");
    setDebouncedSearch("");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
      setDebouncedSearch("");
      setCurrentPage(1);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && paginatedMedicamentos.length > 0) {
      e.preventDefault();
      handleSelect(paginatedMedicamentos[0]);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <div className="relative flex items-center w-full">
        <PopoverTrigger
          id={id}
          type="button"
          disabled={disabled || !almacenId}
          aria-expanded={isOpen}
          className={cn(
            "w-full h-6.5 px-2 flex items-center justify-between gap-1.5 text-xs rounded-md border bg-background text-left transition-all cursor-pointer shadow-2xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
            error
              ? "border-destructive focus-visible:ring-destructive"
              : "border-input hover:border-teal-500/50",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none",
            selectedMedicamento && !disabled ? "pr-11" : "pr-6",
            className
          )}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Pill
              className={cn(
                "size-3 shrink-0",
                selectedMedicamento
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-muted-foreground"
              )}
            />
            {selectedMedicamento ? (
              <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                <span className="font-mono font-bold text-[9px] text-teal-700 dark:text-teal-300 bg-teal-500/10 px-1 py-0.2 rounded shrink-0">
                  {selectedMedicamento.codigo}
                </span>
                <span className="font-medium text-foreground truncate text-xs">
                  {selectedMedicamento.nombre}
                </span>
                <span className="font-semibold text-[10px] text-teal-700 dark:text-teal-300 bg-teal-500/10 px-1.5 py-0.2 rounded shrink-0">
                  Marca: {getMedicineBrand(selectedMedicamento)}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                  (Stock: {selectedMedicamento.stockDisponible})
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
              <Loader2 className="size-3 animate-spin text-teal-600" />
            ) : (
              <ChevronsUpDown className="size-3 opacity-60" />
            )}
          </div>
        </PopoverTrigger>

        {selectedMedicamento && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            title="Quitar selección"
            aria-label="Quitar selección"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      <PopoverContent
        align="start"
        className="w-[360px] sm:w-[460px] p-1.5 max-h-[420px] overflow-hidden flex flex-col rounded-xl shadow-xl border-border/80 z-50"
      >
        {/* Search header */}
        <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border/50 bg-muted/20 rounded-md mb-1 shrink-0">
          <Search className="size-3.5 text-muted-foreground shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar por código, nombre o marca..."
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
        <div className="overflow-y-auto max-h-60 pr-0.5 space-y-0.5 flex-1">
          {isLoading && stockMedicamentos.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-teal-600" />
              <span>Cargando catálogo de medicamentos...</span>
            </div>
          ) : paginatedMedicamentos.length === 0 ? (
            <div className="px-3 py-6 text-xs text-muted-foreground text-center">
              No se encontraron medicamentos con stock en este almacén.
            </div>
          ) : (
            <ul className="space-y-0.5">
              {paginatedMedicamentos.map((med) => {
                const isSelected = selectedMedicamento?.productoId === med.productoId;
                const hasLots = med.lotes && med.lotes.length > 0;

                return (
                  <li key={med.productoId}>
                    <button
                      type="button"
                      onClick={() => handleSelect(med)}
                      className={cn(
                        "w-full flex cursor-pointer select-none items-center justify-between rounded-lg px-2 py-1.5 outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors text-xs text-left",
                        isSelected && "bg-accent/80 font-medium text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="size-5 rounded flex items-center justify-center shrink-0 border bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400">
                          <Pill className="size-3" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-[10px] text-foreground bg-muted px-1 py-0.2 rounded shrink-0">
                              {med.codigo}
                            </span>
                            <span className="truncate font-medium text-xs text-foreground">
                              {med.nombre}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                            <span className="truncate text-teal-700 dark:text-teal-300 font-semibold bg-teal-500/10 px-1.5 py-0.5 rounded text-[10px]">
                              Marca: {getMedicineBrand(med)}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-foreground font-mono">
                              Bs. {med.precioReferencial.toFixed(2)}
                            </span>
                            <span>•</span>
                            <span
                              className={cn(
                                "font-mono font-semibold px-1 rounded text-[9px]",
                                med.stockDisponible > 10
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                  : med.stockDisponible > 0
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                    : "bg-destructive/10 text-destructive"
                              )}
                            >
                              Stock: {med.stockDisponible} {med.unidadMedida || ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="size-3.5 text-teal-600 ml-1.5 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer with Pagination Controls */}
        <div className="flex items-center justify-between px-2 pt-1.5 mt-1 border-t border-border/40 text-[10px] text-muted-foreground shrink-0">
          <div>
            {isFetching ? (
              <span className="inline-flex items-center gap-1 text-teal-600">
                <Loader2 className="size-2.5 animate-spin" />
                Actualizando...
              </span>
            ) : (
              <span>
                Total: <strong className="text-foreground">{totalItems}</strong>{" "}
                {totalItems === 1 ? "medicamento" : "medicamentos"}
              </span>
            )}
          </div>

          {/* Pagination buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="size-5 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Página anterior"
              >
                <ChevronLeft className="size-3" />
              </Button>

              <span className="font-mono text-[10px] text-foreground font-medium px-1">
                {safePage} / {totalPages}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="size-5 text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Página siguiente"
              >
                <ChevronRight className="size-3" />
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
