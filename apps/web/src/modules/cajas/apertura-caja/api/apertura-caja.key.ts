export const aperturaCajaKeys = {
  all: ["aperturas-caja"] as const,
  lists: () => [...aperturaCajaKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...aperturaCajaKeys.lists(), params] as const,
  details: () => [...aperturaCajaKeys.all, "detail"] as const,
  detail: (id: number) => [...aperturaCajaKeys.details(), id] as const,
  byTurno: (turnoCajaId: number) =>
    [...aperturaCajaKeys.all, "by-turno", turnoCajaId] as const,
};
