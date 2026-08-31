import { apiClient } from "@/lib/api/api-client";
import type {
  ProductoQueryParams,
  ProductoResponse,
  CreateProductoRequest,
  PagedResult,
  UpdateProductoRequest,
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
