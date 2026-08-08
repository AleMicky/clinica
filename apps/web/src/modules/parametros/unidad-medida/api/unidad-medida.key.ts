export const unidadMedidaKeys = {
  all: ["unidades-medida"] as const,
  lists: () => [...unidadMedidaKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...unidadMedidaKeys.lists(), filters] as const,
  details: () => [...unidadMedidaKeys.all, "detail"] as const,
  detail: (id: number) => [...unidadMedidaKeys.details(), id] as const,
};
