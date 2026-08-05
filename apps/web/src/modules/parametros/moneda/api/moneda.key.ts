export const monedaKeys = {
  all: ["monedas"] as const,
  lists: () => [...monedaKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...monedaKeys.lists(), filters] as const,
  details: () => [...monedaKeys.all, "detail"] as const,
  detail: (id: number) => [...monedaKeys.details(), id] as const,
};

export const tipoCambioKeys = {
  all: ["tipos-cambio"] as const,
  lists: () => [...tipoCambioKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...tipoCambioKeys.lists(), filters] as const,
  details: () => [...tipoCambioKeys.all, "detail"] as const,
  detail: (id: number) => [...tipoCambioKeys.details(), id] as const,
};
