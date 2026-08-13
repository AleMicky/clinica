export const bancoKeys = {
  all: ["bancos"] as const,
  lists: () => [...bancoKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) => [...bancoKeys.lists(), params] as const,
  details: () => [...bancoKeys.all, "detail"] as const,
  detail: (id: number) => [...bancoKeys.details(), id] as const,
  
  cuentasAll: (bancoId: number) => [...bancoKeys.detail(bancoId), "cuentas"] as const,
  cuentasList: (bancoId: number, params?: Record<string, unknown>) => [...bancoKeys.cuentasAll(bancoId), "list", params] as const,
  cuentaDetail: (bancoId: number, cuentaId: number) => [...bancoKeys.cuentasAll(bancoId), "detail", cuentaId] as const,
};
