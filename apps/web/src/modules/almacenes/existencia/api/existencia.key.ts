export const existenciaKeys = {
  all: ["existencias"] as const,
  lists: () => [...existenciaKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...existenciaKeys.lists(), params] as const,
  details: () => [...existenciaKeys.all, "detail"] as const,
  detail: (id: number) => [...existenciaKeys.details(), id] as const,
};
