export const servicioKeys = {
  all: ["servicios"] as const,
  byCategory: (categoriaId: number) => [...servicioKeys.all, "byCategory", categoriaId] as const,
  list: (categoriaId: number, filters?: Record<string, unknown>) =>
    [...servicioKeys.byCategory(categoriaId), "list", filters] as const,
  detail: (categoriaId: number, id: number) =>
    [...servicioKeys.byCategory(categoriaId), "detail", id] as const,
};
