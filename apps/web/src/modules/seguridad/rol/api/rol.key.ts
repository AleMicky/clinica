export const rolKeys = {
  all: ["roles"] as const,
  lists: () => [...rolKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...rolKeys.lists(), filters] as const,
  details: () => [...rolKeys.all, "detail"] as const,
  detail: (id: number) => [...rolKeys.details(), id] as const,
};
