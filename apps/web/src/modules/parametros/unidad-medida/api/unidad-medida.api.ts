import { apiClient } from "@/lib/api/api-client";
import type {
  CreateUnidadMedidaRequest,
  ExcelImportResult,
  PagedResult,
  UnidadMedidaQueryParams,
  UnidadMedidaResponse,
  UpdateUnidadMedidaRequest,
} from "../types/unidad-medida.types";

export async function getUnidadesMedida(
  params?: UnidadMedidaQueryParams
): Promise<PagedResult<UnidadMedidaResponse>> {
  const response = await apiClient.get<PagedResult<UnidadMedidaResponse>>(
    "/unidades-medida",
    { params }
  );
  return response.data;
}

export async function getUnidadMedidaById(id: number): Promise<UnidadMedidaResponse> {
  const response = await apiClient.get<UnidadMedidaResponse>(`/unidades-medida/${id}`);
  return response.data;
}

export async function createUnidadMedida(
  request: CreateUnidadMedidaRequest
): Promise<UnidadMedidaResponse> {
  const response = await apiClient.post<UnidadMedidaResponse>("/unidades-medida", request);
  return response.data;
}

export async function updateUnidadMedida(
  id: number,
  request: UpdateUnidadMedidaRequest
): Promise<UnidadMedidaResponse> {
  const response = await apiClient.put<UnidadMedidaResponse>(
    `/unidades-medida/${id}`,
    request
  );
  return response.data;
}

export async function deleteUnidadMedida(id: number): Promise<void> {
  await apiClient.delete(`/unidades-medida/${id}`);
}

// Importación masiva desde Excel
export async function importarUnidadesMedidaExcel(
  archivo: File
): Promise<ExcelImportResult> {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const response = await apiClient.post<ExcelImportResult>(
    "/unidades-medida/importar-excel",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

// Descarga de plantilla Excel oficial (.xlsx)
export async function descargarPlantillaUnidadesMedidaExcel(): Promise<Blob> {
  const response = await apiClient.get<Blob>("/unidades-medida/plantilla-excel", {
    responseType: "blob",
  });
  return response.data;
}

