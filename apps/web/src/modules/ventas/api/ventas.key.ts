export const ventaKeys = {
  all: ["ventas"] as const,
  lists: () => [...ventaKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...ventaKeys.lists(), params ?? {}] as const,
  details: () => [...ventaKeys.all, "detail"] as const,
  detail: (id: number) => [...ventaKeys.details(), id] as const,
  detalles: (ventaId: number) =>
    [...ventaKeys.detail(ventaId), "detalles"] as const,
  pagadores: (ventaId: number) =>
    [...ventaKeys.detail(ventaId), "pagadores"] as const,
};
