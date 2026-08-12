export const admisionKeys = {
  all: ["admisiones"] as const,
  lists: () => [...admisionKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...admisionKeys.lists(), params ?? {}] as const,
  details: () => [...admisionKeys.all, "detail"] as const,
  detail: (id: number) => [...admisionKeys.details(), id] as const,
  detalles: (admisionId: number) =>
    [...admisionKeys.detail(admisionId), "detalles"] as const,
};
