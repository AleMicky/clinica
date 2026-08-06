export const cargoKeys = {
    all: ["cargos"] as const,
    lists: () => [...cargoKeys.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...cargoKeys.lists(), filters] as const,
    details: () => [...cargoKeys.all, "detail"] as const,
    detail: (id: number) => [...cargoKeys.details(), id] as const,
};