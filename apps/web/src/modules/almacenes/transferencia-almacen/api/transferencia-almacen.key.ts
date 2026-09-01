import type { TransferenciaAlmacenQueryParams } from "../types/transferencia-almacen.types";

export const transferenciaAlmacenKeys = {
  all: ["transferencias-almacen"] as const,
  lists: () => [...transferenciaAlmacenKeys.all, "list"] as const,
  list: (params?: TransferenciaAlmacenQueryParams) =>
    [...transferenciaAlmacenKeys.lists(), params] as const,
  details: () => [...transferenciaAlmacenKeys.all, "detail"] as const,
  detail: (id: number) => [...transferenciaAlmacenKeys.details(), id] as const,
};
