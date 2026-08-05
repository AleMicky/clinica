export const personaKeys = {
  all: ["personas"] as const,
  lists: () => [...personaKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...personaKeys.lists(), filters] as const,
  details: () => [...personaKeys.all, "detail"] as const,
  detail: (id: number) => [...personaKeys.details(), id] as const,
};
