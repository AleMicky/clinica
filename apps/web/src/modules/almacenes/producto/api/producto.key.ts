import type { ProductoQueryParams } from "../types/producto.types";

export const productoKeys = {
  all: ["productos"] as const,
  lists: () => [...productoKeys.all, "list"] as const,
  list: (params?: ProductoQueryParams) => [...productoKeys.lists(), params] as const,
  details: () => [...productoKeys.all, "detail"] as const,
  detail: (id: number) => [...productoKeys.details(), id] as const,
};
