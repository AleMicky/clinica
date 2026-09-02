export const proveedorKeys = {
  all: ["proveedores"] as const,
  lists: () => [...proveedorKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...proveedorKeys.lists(), params] as const,
  details: () => [...proveedorKeys.all, "detail"] as const,
  detail: (id: number) => [...proveedorKeys.details(), id] as const,
};
