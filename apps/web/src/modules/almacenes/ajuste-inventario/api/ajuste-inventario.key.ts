import type { AjusteInventarioQueryParams } from "../types/ajuste-inventario.types";

export const ajusteInventarioKeys = {
  all: ["ajustes-inventario"] as const,
  lists: () => [...ajusteInventarioKeys.all, "list"] as const,
  list: (params?: AjusteInventarioQueryParams) =>
    [...ajusteInventarioKeys.lists(), params] as const,
  details: () => [...ajusteInventarioKeys.all, "detail"] as const,
  detail: (id: number) => [...ajusteInventarioKeys.details(), id] as const,
};
