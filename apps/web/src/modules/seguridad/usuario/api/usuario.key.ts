export const usuarioKeys = {
  all: ["usuarios"] as const,
  lists: () => [...usuarioKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...usuarioKeys.lists(), filters] as const,
  details: () => [...usuarioKeys.all, "detail"] as const,
  detail: (id: number) => [...usuarioKeys.details(), id] as const,
};
