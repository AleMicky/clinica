import { apiClient } from "@/lib/api/api-client";
import type {
  ProductoQueryParams,
  ExportarProductosQueryParams,
  ProductoResponse,
  CreateProductoRequest,
  PagedResult,
  UpdateProductoRequest,
  ExcelImportResult,
  DeleteMultipleProductosResponse,
} from "../types/producto.types";

export async function getProductos(
  params?: ProductoQueryParams
): Promise<PagedResult<ProductoResponse>> {
  const response = await apiClient.get<PagedResult<ProductoResponse>>(
    "/productos",
    { params }
  );
  return response.data;
}

export async function getProductoById(
  id: number
): Promise<ProductoResponse> {
  const response = await apiClient.get<ProductoResponse>(
    `/productos/${id}`
  );
  return response.data;
}

export async function createProducto(
  request: CreateProductoRequest
): Promise<ProductoResponse> {
  const response = await apiClient.post<ProductoResponse>(
    "/productos",
    request
  );
  return response.data;
}

export async function updateProducto(
  id: number,
  request: UpdateProductoRequest
): Promise<ProductoResponse> {
  const response = await apiClient.put<ProductoResponse>(
    `/productos/${id}`,
    request
  );
  return response.data;
}

export async function deleteProducto(id: number): Promise<void> {
  await apiClient.delete(`/productos/${id}`);
}

export async function deleteProductosMultiple(
  ids: number[]
): Promise<DeleteMultipleProductosResponse> {
  const response = await apiClient.post<DeleteMultipleProductosResponse>(
    "/productos/eliminar-multiple",
    { ids }
  );
  return response.data;
}


// Importación masiva desde Excel
export async function importarProductosExcel(
  archivo: File
): Promise<ExcelImportResult> {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const response = await apiClient.post<ExcelImportResult>(
    "/productos/importar-excel",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

// Exportación / Reporte Excel oficial (.xlsx)
export async function exportarProductosExcel(
  params?: ExportarProductosQueryParams
): Promise<Blob> {
  const response = await apiClient.get<Blob>("/productos/exportar-excel", {
    params,
    responseType: "blob",
  });
  return response.data;
}

// Descarga de plantilla Excel oficial (.xlsx)
export async function descargarPlantillaProductosExcel(): Promise<Blob> {
  const response = await apiClient.get<Blob>("/productos/plantilla-excel", {
    responseType: "blob",
  });
  return response.data;
}

// Obtener partidas asociadas a un producto
export async function getPartidasByProducto(
  productoId: number
): Promise<import("@/modules/almacenes/partida-inventario").PartidaInventarioResponse[]> {
  const response = await apiClient.get<
    import("@/modules/almacenes/partida-inventario").PartidaInventarioResponse[]
  >(`/productos/${productoId}/partidas`);
  return response.data;
}

