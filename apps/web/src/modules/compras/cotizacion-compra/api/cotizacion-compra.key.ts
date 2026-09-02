import type { CotizacionCompraQueryParams } from "../types/cotizacion-compra.types";

export const cotizacionCompraKeys = {
  all: ["cotizaciones-compra"] as const,
  lists: () => [...cotizacionCompraKeys.all, "list"] as const,
  list: (params?: CotizacionCompraQueryParams) =>
    [...cotizacionCompraKeys.lists(), params] as const,
  details: () => [...cotizacionCompraKeys.all, "detail"] as const,
  detail: (id: number) => [...cotizacionCompraKeys.details(), id] as const,
};
