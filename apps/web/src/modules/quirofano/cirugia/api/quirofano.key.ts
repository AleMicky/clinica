import type { CirugiaQueryParams } from "../types/quirofano.types";

export const quirofanoKeys = {
  all: ["quirofano"] as const,
  lists: () => [...quirofanoKeys.all, "list"] as const,
  list: (params?: CirugiaQueryParams) =>
    [...quirofanoKeys.lists(), params] as const,
  details: () => [...quirofanoKeys.all, "detail"] as const,
  detail: (id: number) => [...quirofanoKeys.details(), id] as const,
  metrics: (fechaDesde?: string, fechaHasta?: string) =>
    [...quirofanoKeys.all, "metrics", { fechaDesde, fechaHasta }] as const,
  materialesStock: (almacenId?: number, search?: string) =>
    [...quirofanoKeys.all, "materiales-stock", { almacenId, search }] as const,
};
