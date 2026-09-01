export const tipoMovimientoInventarioKeys = {
  all: ["tipos-movimiento-inventario"] as const,
  lists: () => [...tipoMovimientoInventarioKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...tipoMovimientoInventarioKeys.lists(), params] as const,
  details: () => [...tipoMovimientoInventarioKeys.all, "detail"] as const,
  detail: (id: number) => [...tipoMovimientoInventarioKeys.details(), id] as const,
};
