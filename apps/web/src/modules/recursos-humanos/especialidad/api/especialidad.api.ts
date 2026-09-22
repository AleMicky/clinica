import { apiClient } from "@/lib/api/api-client";
import type {
  CreateEspecialidadRequest,
  EspecialidadQueryParams,
  EspecialidadResponse,
  ExcelImportResult,
  PagedResult,
  UpdateEspecialidadRequest,
} from "../types/especialidad.types";

const BASE = "/especialidades";

export async function getEspecialidades(
  params?: EspecialidadQueryParams
): Promise<PagedResult<EspecialidadResponse>> {
  const response = await apiClient.get<PagedResult<EspecialidadResponse>>(
    BASE,
    { params }
  );
  return response.data;
}

export async function getEspecialidadById(
  id: number
): Promise<EspecialidadResponse> {
  const response = await apiClient.get<EspecialidadResponse>(
    `${BASE}/${id}`
  );
  return response.data;
}

export async function createEspecialidad(
  request: CreateEspecialidadRequest
): Promise<EspecialidadResponse> {
  const response = await apiClient.post<EspecialidadResponse>(
    BASE,
    request
  );
  return response.data;
}

export async function updateEspecialidad(
  id: number,
  request: UpdateEspecialidadRequest
): Promise<EspecialidadResponse> {
  const response = await apiClient.put<EspecialidadResponse>(
    `${BASE}/${id}`,
    request
  );
  return response.data;
}

export async function deleteEspecialidad(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

// Importación masiva desde Excel
export async function importarEspecialidadesExcel(
  archivo: File
): Promise<ExcelImportResult> {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const response = await apiClient.post<ExcelImportResult>(
    `${BASE}/importar-excel`,
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
export async function descargarPlantillaEspecialidadesExcel(): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `${BASE}/plantilla-excel`,
    {
      responseType: "blob",
    }
  );
  return response.data;
}

// Exportación del listado general de especialidades a Excel (.xlsx)
export async function exportarEspecialidadesExcel(search?: string): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `${BASE}/exportar-excel`,
    {
      params: search ? { search } : undefined,
      responseType: "blob",
    }
  );
  return response.data;
}
