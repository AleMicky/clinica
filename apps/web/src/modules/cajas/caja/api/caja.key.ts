export const cajaKeys = {
  all: ["cajas"] as const,
  lists: () => [...cajaKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...cajaKeys.lists(), params] as const,
  details: () => [...cajaKeys.all, "detail"] as const,
  detail: (id: number) => [...cajaKeys.details(), id] as const,
};
