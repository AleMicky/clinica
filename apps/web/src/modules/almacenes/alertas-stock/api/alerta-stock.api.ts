import { apiClient } from "@/lib/api/api-client";
import type {
  AlertaStockResponse,
  AlertasStockQueryParams,
} from "../types/alerta-stock.types";

export async function getAlertasStock(
  params?: AlertasStockQueryParams
): Promise<AlertaStockResponse[]> {
  const response = await apiClient.get<AlertaStockResponse[]>("/alertas-stock", {
    params,
  });
  return response.data;
}
