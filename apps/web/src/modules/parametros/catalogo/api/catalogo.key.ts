export const catalogoKeys = {
  all: ["catalogos"] as const,
  grupos: () => [...catalogoKeys.all, "grupos"] as const,
  grupoList: (filters?: Record<string, unknown>) => [...catalogoKeys.grupos(), "list", filters] as const,
  grupoDetail: (id: number) => [...catalogoKeys.grupos(), "detail", id] as const,
  items: (grupoId: number) => [...catalogoKeys.all, "grupo", grupoId, "items"] as const,
  itemList: (grupoId: number, filters?: Record<string, unknown>) =>
    [...catalogoKeys.items(grupoId), "list", filters] as const,
  itemDetail: (grupoId: number, itemId: number) =>
    [...catalogoKeys.items(grupoId), "detail", itemId] as const,
};
