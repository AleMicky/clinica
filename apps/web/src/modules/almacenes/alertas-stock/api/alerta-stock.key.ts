import type { AlertasStockQueryParams } from "../types/alerta-stock.types";

export const alertaStockKeys = {
  all: ["alertas-stock"] as const,
  list: (params?: AlertasStockQueryParams) =>
    [...alertaStockKeys.all, params] as const,
};
