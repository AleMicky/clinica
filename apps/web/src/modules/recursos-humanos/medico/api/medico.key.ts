export const medicoKeys = {
  all: ["medicos"] as const,
  lists: () => [...medicoKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...medicoKeys.lists(), filters] as const,
  details: () => [...medicoKeys.all, "detail"] as const,
  detail: (id: number) => [...medicoKeys.details(), id] as const,
  especialidades: (medicoId: number) => [...medicoKeys.all, medicoId, "especialidades"] as const,
  acuerdos: (medicoId: number) => [...medicoKeys.all, medicoId, "acuerdos"] as const,
};
