import { apiClient } from "@/lib/api/api-client";
import type { KardexQueryParams, KardexResponse } from "../types/kardex.types";

export async function getKardex(params?: KardexQueryParams): Promise<KardexResponse> {
  const response = await apiClient.get<KardexResponse>("/kardex", { params });
  return response.data;
}
