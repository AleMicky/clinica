import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getAlertasStock } from "../api/alerta-stock.api";
import { alertaStockKeys } from "../api/alerta-stock.key";
import type {
  AlertaStockResponse,
  AlertasStockQueryParams,
} from "../types/alerta-stock.types";

export function useAlertasStock(
  params?: AlertasStockQueryParams,
  options?: Omit<
    UseQueryOptions<AlertaStockResponse[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: alertaStockKeys.list(params),
    queryFn: () => getAlertasStock(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
