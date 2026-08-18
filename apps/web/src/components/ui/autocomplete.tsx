"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

export interface AutocompleteProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  emptyText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  allowCustomValue?: boolean;
}

export function Autocomplete({
  value = "",
  onValueChange,
  options,
  placeholder = "Seleccionar o buscar...",
  emptyText = "No se encontraron resultados.",
  isLoading = false,
  disabled = false,
  error = false,
  className,
  id,
  allowCustomValue = true,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Synchronize input query with external value prop change
  React.useEffect(() => {
    if (!value) {
      setQuery("");
      return;
    }
    const selectedOpt = options.find(
      (opt) => opt.value.toLowerCase() === value.toLowerCase()
    );
    const nextQuery = selectedOpt ? selectedOpt.label : value;
    setQuery((prev) => (prev !== nextQuery ? nextQuery : prev));
  }, [value, options]);

  // Handle clicking outside the popover container
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!isOpen) return;
        setIsOpen(false);
        if (allowCustomValue) {
          if (query !== value) {
            onValueChange(query);
          }
        } else {
          if (!query.trim()) {
            setQuery("");
            if (value) {
              onValueChange("");
            }
            return;
          }

          const matchedOption = options.find(
            (opt) => opt.label.toLowerCase() === query.toLowerCase().trim()
          );
          if (matchedOption) {
            setQuery(matchedOption.label);
            if (matchedOption.value !== value) {
              onValueChange(matchedOption.value);
            }
          } else {
            const currentSelected = options.find(
              (opt) => opt.value.toLowerCase() === (value || "").toLowerCase()
            );
            if (currentSelected) {
              setQuery(currentSelected.label);
            } else {
              setQuery("");
              if (value) {
                onValueChange("");
              }
            }
          }
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, allowCustomValue, query, value, options, onValueChange]);

  const filteredOptions = React.useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q))
    );
  }, [options, query]);

  const handleSelectOption = (option: AutocompleteOption) => {
    if (option.value.toLowerCase() === (value || "").toLowerCase()) {
      // Toggle off / deseleccionar si ya estaba seleccionado
      setQuery("");
      onValueChange("");
      setIsOpen(false);
      return;
    }
    setQuery(option.label);
    onValueChange(option.value);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuery("");
    onValueChange("");
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
            if (allowCustomValue) {
              onValueChange(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            } else if (e.key === "Enter" && isOpen) {
              if (filteredOptions.length > 0) {
                e.preventDefault();
                handleSelectOption(filteredOptions[0]);
              } else if (allowCustomValue) {
                onValueChange(query);
                setIsOpen(false);
              } else if (!query.trim()) {
                onValueChange("");
                setIsOpen(false);
              }
            }
          }}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-8",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
        />

        <div className="absolute right-2 flex items-center text-muted-foreground">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-primary" />
          ) : query && !disabled ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              className="rounded-full p-0.5 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-3.5" />
              <span className="sr-only">Limpiar</span>
            </button>
          ) : (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setIsOpen((prev) => !prev)}
              className="p-0.5 hover:text-foreground transition-colors cursor-pointer"
            >
              <ChevronsUpDown className="size-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-56 min-w-full w-max max-w-lg overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
          {isLoading && filteredOptions.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-3 py-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Cargando opciones...</span>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-3 py-2.5 text-xs text-muted-foreground text-center">
              {emptyText}
            </div>
          ) : (
            <ul className="p-1 text-sm">
              {filteredOptions.map((option) => {
                const isSelected =
                  option.value.toLowerCase() === (value || "").toLowerCase();
                return (
                  <li
                    key={option.value}
                    onClick={() => handleSelectOption(option)}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2.5 py-1.5 text-xs outline-hidden hover:bg-accent hover:text-accent-foreground transition-colors",
                      isSelected && "bg-accent/60 font-medium text-accent-foreground"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-[10px] text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="size-3.5 text-primary ml-2 shrink-0" />}
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
