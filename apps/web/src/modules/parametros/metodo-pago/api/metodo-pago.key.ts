export const metodoPagoKeys = {
  all: ["metodos-pago"] as const,
  lists: () => [...metodoPagoKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...metodoPagoKeys.lists(), params] as const,
  details: () => [...metodoPagoKeys.all, "detail"] as const,
  detail: (id: number) => [...metodoPagoKeys.details(), id] as const,
};
