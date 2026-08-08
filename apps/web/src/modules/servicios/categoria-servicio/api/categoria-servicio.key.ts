export const categoriaServicioKeys = {
  all: ["categorias-servicios"] as const,
  lists: () => [...categoriaServicioKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...categoriaServicioKeys.lists(), filters] as const,
  details: () => [...categoriaServicioKeys.all, "detail"] as const,
  detail: (id: number) => [...categoriaServicioKeys.details(), id] as const,
};
