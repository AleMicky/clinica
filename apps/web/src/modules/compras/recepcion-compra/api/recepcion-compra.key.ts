import type { RecepcionCompraQueryParams } from "../types/recepcion-compra.types";

export const recepcionCompraKeys = {
  all: ["recepciones-compra"] as const,
  lists: () => [...recepcionCompraKeys.all, "list"] as const,
  list: (params?: RecepcionCompraQueryParams) =>
    [...recepcionCompraKeys.lists(), params] as const,
  details: () => [...recepcionCompraKeys.all, "detail"] as const,
  detail: (id: number) => [...recepcionCompraKeys.details(), id] as const,
};
