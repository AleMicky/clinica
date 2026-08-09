"use client";

import * as React from "react";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { useCatalogoItemsByCodigo, type CatalogoItemResponse } from "@/modules/parametros/catalogo";

export interface CatalogoAutocompleteProps {
  codigo: string;
  value?: string;
  onValueChange: (value: string) => void;
  fallbackOptions?: (string | AutocompleteOption)[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  allowCustomValue?: boolean;
}

export function CatalogoAutocomplete({
  codigo,
  value = "",
  onValueChange,
  fallbackOptions = [],
  placeholder = "Seleccione o busque...",
  emptyText = "No se encontraron resultados.",
  disabled = false,
  error = false,
  className = "h-9 text-sm",
  id,
  allowCustomValue = true,
}: CatalogoAutocompleteProps) {
  const { data: catalogosData, isLoading } = useCatalogoItemsByCodigo(codigo, undefined, {
    enabled: Boolean(codigo),
  });

  const options: AutocompleteOption[] = React.useMemo(() => {
    const apiItems = (catalogosData?.items || [])
      .filter((item: CatalogoItemResponse) => item.activo !== false)
      .map((item: CatalogoItemResponse) => {
        const val = item.nombre || item.valor || "";
        const label = item.nombre || item.valor || "";
        return { value: val, label: label };
      });

    if (apiItems.length > 0) {
      return apiItems;
    }

    return fallbackOptions.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    );
  }, [catalogosData, fallbackOptions]);

  return (
    <Autocomplete
      id={id}
      value={value}
      onValueChange={onValueChange}
      options={options}
      isLoading={isLoading}
      placeholder={placeholder}
      emptyText={emptyText}
      disabled={disabled}
      error={error}
      className={className}
      allowCustomValue={allowCustomValue}
    />
  );
}
