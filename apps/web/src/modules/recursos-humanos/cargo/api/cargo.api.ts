import { apiClient } from "@/lib/api/api-client";
import type {
    CargoQueryParams,
    CargoResponse,
    CreateCargoRequest,
    ExcelImportResult,
    PagedResult,
    UpdateCargoRequest,
} from "../types/cargo.types";

const BASE = "/cargos";

export async function getCargos(
    params?: CargoQueryParams,
): Promise<PagedResult<CargoResponse>> {
    const response = await apiClient.get<PagedResult<CargoResponse>>(BASE, {
        params,
    });
    return response.data;
}

export async function getCargoById(
    id: number,
): Promise<CargoResponse> {
    const response = await apiClient.get<CargoResponse>(`${BASE}/${id}`);
    return response.data;
}

export async function createCargo(
    request: CreateCargoRequest,
): Promise<CargoResponse> {
    const response = await apiClient.post<CargoResponse>(BASE, request);
    return response.data;
}

export async function updateCargo(
    id: number,
    request: UpdateCargoRequest,
): Promise<CargoResponse> {
    const response = await apiClient.put<CargoResponse>(`${BASE}/${id}`, request);
    return response.data;
}

export async function deleteCargo(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/${id}`);
}

// Importación masiva desde Excel
export async function importarCargosExcel(
    archivo: File,
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
        },
    );
    return response.data;
}

// Descarga de plantilla Excel oficial (.xlsx)
export async function descargarPlantillaCargosExcel(): Promise<Blob> {
    const response = await apiClient.get<Blob>(
        `${BASE}/plantilla-excel`,
        {
            responseType: "blob",
        },
    );
    return response.data;
}

// Exportación del listado general de cargos a Excel (.xlsx)
export async function exportarCargosExcel(search?: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(
        `${BASE}/exportar-excel`,
        {
            params: search ? { search } : undefined,
            responseType: "blob",
        },
    );
    return response.data;
}