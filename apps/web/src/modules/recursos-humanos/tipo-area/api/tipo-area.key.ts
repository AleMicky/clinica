export const tipoAreaKeys = {
    all: ["tipos-area"] as const,
    lists: () => [...tipoAreaKeys.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...tipoAreaKeys.lists(), filters] as const,
    details: () => [...tipoAreaKeys.all, "detail"] as const,
    detail: (id: number) => [...tipoAreaKeys.details(), id] as const,
};