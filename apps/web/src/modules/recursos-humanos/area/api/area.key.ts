export const areaKeys = {
    all: ["areas"] as const,
    lists: () => [...areaKeys.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...areaKeys.lists(), filters] as const,
    arbol: () => [...areaKeys.all, "arbol"] as const,
    subareas: (id: number) => [...areaKeys.all, "subareas", id] as const,
    details: () => [...areaKeys.all, "detail"] as const,
    detail: (id: number) => [...areaKeys.details(), id] as const,
};