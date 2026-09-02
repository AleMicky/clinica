import type { DevolucionProveedorQueryParams } from "../types/devolucion-proveedor.types";

export const devolucionProveedorKeys = {
  all: ["devoluciones-proveedor"] as const,
  lists: () => [...devolucionProveedorKeys.all, "list"] as const,
  list: (params?: DevolucionProveedorQueryParams) =>
    [...devolucionProveedorKeys.lists(), params] as const,
  details: () => [...devolucionProveedorKeys.all, "detail"] as const,
  detail: (id: number) => [...devolucionProveedorKeys.details(), id] as const,
};
