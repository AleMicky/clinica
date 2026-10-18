export const movimientoCajaKeys = {
  all: ["movimientos-caja"] as const,
  lists: () => [...movimientoCajaKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...movimientoCajaKeys.lists(), params] as const,
  details: () => [...movimientoCajaKeys.all, "detail"] as const,
  detail: (id: number) => [...movimientoCajaKeys.details(), id] as const,
  tipos: (naturaleza?: string) =>
    [...movimientoCajaKeys.all, "tipos", naturaleza] as const,
  conceptos: (tipoMovimientoCajaId?: number) =>
    [...movimientoCajaKeys.all, "conceptos", tipoMovimientoCajaId] as const,
  metrics: () => [...movimientoCajaKeys.all, "metrics"] as const,
  metric: (params?: Record<string, unknown>) =>
    [...movimientoCajaKeys.metrics(), params] as const,
};
