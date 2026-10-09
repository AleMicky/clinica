import { apiClient } from "@/lib/api/api-client";
import type {
  CreateProveedorRequest,
  ExcelImportResult,
  PagedResult,
  ProveedorQueryParams,
  ProveedorResponse,
  UpdateProveedorRequest,
} from "../types/proveedor.types";

export async function getProveedores(
  params?: ProveedorQueryParams
): Promise<PagedResult<ProveedorResponse>> {
  const response = await apiClient.get<PagedResult<ProveedorResponse>>(
    "/proveedores",
    { params }
  );
  return response.data;
}

export async function getProveedorById(
  id: number
): Promise<ProveedorResponse> {
  const response = await apiClient.get<ProveedorResponse>(
    `/proveedores/${id}`
  );
  return response.data;
}

export async function createProveedor(
  request: CreateProveedorRequest
): Promise<ProveedorResponse> {
  const response = await apiClient.post<ProveedorResponse>(
    "/proveedores",
    request
  );
  return response.data;
}

export async function updateProveedor(
  id: number,
  request: UpdateProveedorRequest
): Promise<ProveedorResponse> {
  const response = await apiClient.put<ProveedorResponse>(
    `/proveedores/${id}`,
    request
  );
  return response.data;
}

export async function deleteProveedor(id: number): Promise<void> {
  await apiClient.delete(`/proveedores/${id}`);
}

// Importación masiva desde Excel
export async function importarProveedoresExcel(
  archivo: File
): Promise<ExcelImportResult> {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const response = await apiClient.post<ExcelImportResult>(
    "/proveedores/importar-excel",
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
export async function descargarPlantillaProveedoresExcel(): Promise<Blob> {
  const response = await apiClient.get<Blob>("/proveedores/plantilla-excel", {
    responseType: "blob",
  });
  return response.data;
}
