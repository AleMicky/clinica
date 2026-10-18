export const conceptoMovimientoCajaKeys = {
  all: ["conceptos-movimiento-caja"] as const,
  lists: () => [...conceptoMovimientoCajaKeys.all, "list"] as const,
  list: (tipoMovimientoCajaId?: number) =>
    [...conceptoMovimientoCajaKeys.lists(), { tipoMovimientoCajaId }] as const,
  details: () => [...conceptoMovimientoCajaKeys.all, "detail"] as const,
  detail: (id: number) => [...conceptoMovimientoCajaKeys.details(), id] as const,
};
