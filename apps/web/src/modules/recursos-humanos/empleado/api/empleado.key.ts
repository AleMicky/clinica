export const empleadoKeys = {
    all: ["empleados"] as const,
    lists: () => [...empleadoKeys.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
        [...empleadoKeys.lists(), filters] as const,
    permitidos: () => [...empleadoKeys.all, "permitidos"] as const,
    details: () => [...empleadoKeys.all, "detail"] as const,
    detail: (id: number) => [...empleadoKeys.details(), id] as const,
};