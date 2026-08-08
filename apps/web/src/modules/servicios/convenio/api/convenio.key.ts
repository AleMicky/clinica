export const convenioKeys = {
  all: ["convenios"] as const,
  lists: () => [...convenioKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...convenioKeys.lists(), filters] as const,
  details: () => [...convenioKeys.all, "detail"] as const,
  detail: (id: number) => [...convenioKeys.details(), id] as const,
  tarifarios: (convenioId: number) => [...convenioKeys.detail(convenioId), "tarifarios"] as const,
};
