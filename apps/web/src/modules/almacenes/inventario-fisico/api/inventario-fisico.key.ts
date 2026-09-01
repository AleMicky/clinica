import type { InventarioFisicoQueryParams } from "../types/inventario-fisico.types";

export const inventarioFisicoKeys = {
  all: ["inventarios-fisicos"] as const,
  lists: () => [...inventarioFisicoKeys.all, "list"] as const,
  list: (params?: InventarioFisicoQueryParams) =>
    [...inventarioFisicoKeys.lists(), params] as const,
  details: () => [...inventarioFisicoKeys.all, "detail"] as const,
  detail: (id: number) => [...inventarioFisicoKeys.details(), id] as const,
};
