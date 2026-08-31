export const almacenKeys = {
  all: ["almacenes"] as const,
  lists: () => [...almacenKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...almacenKeys.lists(), filters] as const,
  details: () => [...almacenKeys.all, "detail"] as const,
  detail: (id: number) => [...almacenKeys.details(), id] as const,
};
