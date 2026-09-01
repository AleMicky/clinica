import type { BajaInventarioQueryParams } from "../types/baja-inventario.types";

export const bajaInventarioKeys = {
  all: ["bajas-inventario"] as const,
  lists: () => [...bajaInventarioKeys.all, "list"] as const,
  list: (params?: BajaInventarioQueryParams) =>
    [...bajaInventarioKeys.lists(), params] as const,
  details: () => [...bajaInventarioKeys.all, "detail"] as const,
  detail: (id: number) => [...bajaInventarioKeys.details(), id] as const,
};
