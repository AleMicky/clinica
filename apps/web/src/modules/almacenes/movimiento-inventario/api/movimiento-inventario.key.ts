import type { MovimientoInventarioQueryParams } from "../types/movimiento-inventario.types";

export const movimientoInventarioKeys = {
  all: ["movimientos-inventario"] as const,
  lists: () => [...movimientoInventarioKeys.all, "list"] as const,
  list: (params?: MovimientoInventarioQueryParams) =>
    [...movimientoInventarioKeys.lists(), params] as const,
  details: () => [...movimientoInventarioKeys.all, "detail"] as const,
  detail: (id: number) => [...movimientoInventarioKeys.details(), id] as const,
};
