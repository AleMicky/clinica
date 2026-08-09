export const tarifarioKeys = {
  all: ["tarifarios"] as const,
  lists: () => [...tarifarioKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...tarifarioKeys.lists(), filters] as const,
  details: () => [...tarifarioKeys.all, "detail"] as const,
  detail: (id: number) => [...tarifarioKeys.details(), id] as const,
  detalles: (tarifarioId: number, params?: Record<string, unknown>) =>
    [...tarifarioKeys.detail(tarifarioId), "detalles", params] as const,
};

