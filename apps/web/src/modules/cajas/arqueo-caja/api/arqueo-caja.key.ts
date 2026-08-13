export const arqueoCajaKeys = {
  all: ["arqueos-caja"] as const,
  lists: () => [...arqueoCajaKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...arqueoCajaKeys.lists(), params] as const,
  details: () => [...arqueoCajaKeys.all, "detail"] as const,
  detail: (id: number) => [...arqueoCajaKeys.details(), id] as const,
};
