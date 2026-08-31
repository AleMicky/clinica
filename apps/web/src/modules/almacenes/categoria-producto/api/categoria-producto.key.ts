export const categoriaProductoKeys = {
  all: ["categorias-producto"] as const,
  lists: () => [...categoriaProductoKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...categoriaProductoKeys.lists(), filters] as const,
  details: () => [...categoriaProductoKeys.all, "detail"] as const,
  detail: (id: number) => [...categoriaProductoKeys.details(), id] as const,
};
