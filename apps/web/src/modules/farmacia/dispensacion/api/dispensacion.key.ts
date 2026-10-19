import type { DispensacionQueryParams } from "../types/dispensacion.types";

export const dispensacionKeys = {
  all: ["dispensaciones"] as const,
  list: (params?: DispensacionQueryParams) =>
    [...dispensacionKeys.all, "list", params] as const,
  detail: (id: number) => [...dispensacionKeys.all, "detail", id] as const,
  metrics: (params?: { almacenId?: number; fechaDesde?: string; fechaHasta?: string }) =>
    [...dispensacionKeys.all, "metrics", params] as const,
  medicamentosStock: (almacenId: number, search?: string) =>
    [...dispensacionKeys.all, "medicamentos-stock", almacenId, search] as const,
};
