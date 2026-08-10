export const asignacionEmpleadoKeys = {
    all: ["asignaciones-empleado"] as const,
    lists: () => [...asignacionEmpleadoKeys.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
        [...asignacionEmpleadoKeys.lists(), filters] as const,
    details: () => [...asignacionEmpleadoKeys.all, "detail"] as const,
    detail: (id: number) =>
        [...asignacionEmpleadoKeys.details(), id] as const,
};
