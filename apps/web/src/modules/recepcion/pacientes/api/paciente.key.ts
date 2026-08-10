export const pacienteKeys = {
  all: ["pacientes"] as const,
  lists: () => [...pacienteKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...pacienteKeys.lists(), filters] as const,
  details: () => [...pacienteKeys.all, "detail"] as const,
  detail: (id: number) => [...pacienteKeys.details(), id] as const,
  convenios: (pacienteId: number) => [...pacienteKeys.detail(pacienteId), "convenios"] as const,
};
