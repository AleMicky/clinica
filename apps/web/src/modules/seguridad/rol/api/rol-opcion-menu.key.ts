export const rolOpcionMenuKeys = {
  all: ["roles-opciones-menu"] as const,
  byRol: (rolId: number) => [...rolOpcionMenuKeys.all, "rol", rolId] as const,
  tree: (rolId: number) => [...rolOpcionMenuKeys.all, "tree", rolId] as const,
};
