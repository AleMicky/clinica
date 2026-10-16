import { apiClient } from "@/lib/api/api-client";
import type {
  PartidaInventarioQueryParams,
  PartidaInventarioResponse,
  CreatePartidaInventarioRequest,
  PagedResult,
  UpdatePartidaInventarioRequest,
} from "../types/partida-inventario.types";

export async function getPartidasInventario(
  params?: PartidaInventarioQueryParams
): Promise<PagedResult<PartidaInventarioResponse>> {
  const response = await apiClient.get<PagedResult<PartidaInventarioResponse>>(
    "/partidas-inventario",
    { params }
  );
  return response.data;
}

export async function getPartidaInventarioById(
  id: number
): Promise<PartidaInventarioResponse> {
  const response = await apiClient.get<PartidaInventarioResponse>(
    `/partidas-inventario/${id}`
  );
  return response.data;
}

export async function createPartidaInventario(
  request: CreatePartidaInventarioRequest
): Promise<PartidaInventarioResponse> {
  const response = await apiClient.post<PartidaInventarioResponse>(
    "/partidas-inventario",
    request
  );
  return response.data;
}

export async function updatePartidaInventario(
  id: number,
  request: UpdatePartidaInventarioRequest
): Promise<PartidaInventarioResponse> {
  const response = await apiClient.put<PartidaInventarioResponse>(
    `/partidas-inventario/${id}`,
    request
  );
  return response.data;
}

export async function deletePartidaInventario(id: number): Promise<void> {
  await apiClient.delete(`/partidas-inventario/${id}`);
}
