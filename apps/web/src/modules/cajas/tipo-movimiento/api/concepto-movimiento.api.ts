import { apiClient } from "@/lib/api/api-client";
import type {
  ConceptoMovimientoCajaInfo,
  CreateConceptoMovimientoCajaRequest,
  UpdateConceptoMovimientoCajaRequest,
} from "../types/concepto-movimiento.types";

export async function getConceptosMovimientoCaja(
  tipoMovimientoCajaId?: number
): Promise<ConceptoMovimientoCajaInfo[]> {
  const response = await apiClient.get<ConceptoMovimientoCajaInfo[]>(
    "/movimientos-caja/conceptos",
    { params: { tipoMovimientoCajaId } }
  );
  return response.data;
}

export async function getConceptoMovimientoCajaById(
  id: number
): Promise<ConceptoMovimientoCajaInfo> {
  const response = await apiClient.get<ConceptoMovimientoCajaInfo>(
    `/movimientos-caja/conceptos/${id}`
  );
  return response.data;
}

export async function createConceptoMovimientoCaja(
  data: CreateConceptoMovimientoCajaRequest
): Promise<ConceptoMovimientoCajaInfo> {
  const response = await apiClient.post<ConceptoMovimientoCajaInfo>(
    "/movimientos-caja/conceptos",
    data
  );
  return response.data;
}

export async function updateConceptoMovimientoCaja(
  id: number,
  data: UpdateConceptoMovimientoCajaRequest
): Promise<ConceptoMovimientoCajaInfo> {
  const response = await apiClient.put<ConceptoMovimientoCajaInfo>(
    `/movimientos-caja/conceptos/${id}`,
    data
  );
  return response.data;
}

export async function deleteConceptoMovimientoCaja(id: number): Promise<void> {
  await apiClient.delete(`/movimientos-caja/conceptos/${id}`);
}
