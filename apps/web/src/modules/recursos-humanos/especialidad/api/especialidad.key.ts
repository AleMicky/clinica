export const especialidadKeys = {
  all: ["especialidades"] as const,
  lists: () => [...especialidadKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...especialidadKeys.lists(), filters] as const,
  details: () => [...especialidadKeys.all, "detail"] as const,
  detail: (id: number) => [...especialidadKeys.details(), id] as const,
};
