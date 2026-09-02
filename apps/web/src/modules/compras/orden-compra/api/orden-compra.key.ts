import type { OrdenCompraQueryParams } from "../types/orden-compra.types";

export const ordenCompraKeys = {
  all: ["ordenes-compra"] as const,
  lists: () => [...ordenCompraKeys.all, "list"] as const,
  list: (params?: OrdenCompraQueryParams) =>
    [...ordenCompraKeys.lists(), params] as const,
  details: () => [...ordenCompraKeys.all, "detail"] as const,
  detail: (id: number) => [...ordenCompraKeys.details(), id] as const,
};
