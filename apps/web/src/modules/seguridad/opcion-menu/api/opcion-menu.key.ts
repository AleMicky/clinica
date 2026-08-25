export const opcionMenuKeys = {
  all: ["opciones-menu"] as const,
  lists: () => [...opcionMenuKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...opcionMenuKeys.lists(), params] as const,
  tree: () => [...opcionMenuKeys.all, "tree"] as const,
  details: () => [...opcionMenuKeys.all, "detail"] as const,
  detail: (id: number) => [...opcionMenuKeys.details(), id] as const,
  usuario: () => [...opcionMenuKeys.all, "usuario"] as const,
};
