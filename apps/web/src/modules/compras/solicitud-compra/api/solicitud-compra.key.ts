import type { SolicitudCompraQueryParams } from "../types/solicitud-compra.types";

export const solicitudCompraKeys = {
  all: ["solicitudes-compra"] as const,
  lists: () => [...solicitudCompraKeys.all, "list"] as const,
  list: (params?: SolicitudCompraQueryParams) =>
    [...solicitudCompraKeys.lists(), params] as const,
  details: () => [...solicitudCompraKeys.all, "detail"] as const,
  detail: (id: number) => [...solicitudCompraKeys.details(), id] as const,
};
