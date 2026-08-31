import type { LoteQueryParams } from "../types/lote.types";

export const loteKeys = {
  all: ["lotes"] as const,
  lists: () => [...loteKeys.all, "list"] as const,
  list: (params?: LoteQueryParams) => [...loteKeys.lists(), params] as const,
  byProducto: (productoId: number) => [...loteKeys.lists(), { productoId }] as const,
  details: () => [...loteKeys.all, "detail"] as const,
  detail: (id: number) => [...loteKeys.details(), id] as const,
};
