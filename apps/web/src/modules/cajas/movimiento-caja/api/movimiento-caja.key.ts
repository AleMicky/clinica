export const movimientoCajaKeys = {
  all: ["movimientos-caja"] as const,
  lists: () => [...movimientoCajaKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...movimientoCajaKeys.lists(), params] as const,
  details: () => [...movimientoCajaKeys.all, "detail"] as const,
  detail: (id: number) => [...movimientoCajaKeys.details(), id] as const,
};
