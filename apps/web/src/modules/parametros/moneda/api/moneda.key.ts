export const monedaKeys = {
  all: ["monedas"] as const,
  lists: () => [...monedaKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...monedaKeys.lists(), filters] as const,
  details: () => [...monedaKeys.all, "detail"] as const,
  detail: (id: number) => [...monedaKeys.details(), id] as const,
};
