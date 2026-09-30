export const marcaKeys = {
  all: ["marcas"] as const,
  lists: () => [...marcaKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...marcaKeys.lists(), filters] as const,
  details: () => [...marcaKeys.all, "detail"] as const,
  detail: (id: number) => [...marcaKeys.details(), id] as const,
};
