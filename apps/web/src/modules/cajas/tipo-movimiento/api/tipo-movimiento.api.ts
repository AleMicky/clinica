import { apiClient } from "@/lib/api/api-client";
import type {
  CreateTipoMovimientoCajaRequest,
  TipoMovimientoCajaInfo,
  UpdateTipoMovimientoCajaRequest,
} from "../types/tipo-movimiento.types";

export async function getTiposMovimientoCaja(
  naturaleza?: string
): Promise<TipoMovimientoCajaInfo[]> {
  const response = await apiClient.get<TipoMovimientoCajaInfo[]>(
    "/movimientos-caja/tipos",
    { params: { naturaleza } }
  );
  return response.data;
}

export async function getTipoMovimientoCajaById(
  id: number
): Promise<TipoMovimientoCajaInfo> {
  const response = await apiClient.get<TipoMovimientoCajaInfo>(
    `/movimientos-caja/tipos/${id}`
  );
  return response.data;
}

export async function createTipoMovimientoCaja(
  data: CreateTipoMovimientoCajaRequest
): Promise<TipoMovimientoCajaInfo> {
  const response = await apiClient.post<TipoMovimientoCajaInfo>(
    "/movimientos-caja/tipos",
    data
  );
  return response.data;
}

export async function updateTipoMovimientoCaja(
  id: number,
  data: UpdateTipoMovimientoCajaRequest
): Promise<TipoMovimientoCajaInfo> {
  const response = await apiClient.put<TipoMovimientoCajaInfo>(
    `/movimientos-caja/tipos/${id}`,
    data
  );
  return response.data;
}

export async function deleteTipoMovimientoCaja(id: number): Promise<void> {
  await apiClient.delete(`/movimientos-caja/tipos/${id}`);
}

// Re-export conceptos API for backwards compatibility
export {
  getConceptosMovimientoCaja,
  getConceptoMovimientoCajaById,
  createConceptoMovimientoCaja,
  updateConceptoMovimientoCaja,
  deleteConceptoMovimientoCaja,
} from "./concepto-movimiento.api";
