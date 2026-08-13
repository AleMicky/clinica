export const turnoCajaKeys = {
  all: ["turnos-caja"] as const,
  lists: () => [...turnoCajaKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...turnoCajaKeys.lists(), params] as const,
  details: () => [...turnoCajaKeys.all, "detail"] as const,
  detail: (id: number) => [...turnoCajaKeys.details(), id] as const,
};
