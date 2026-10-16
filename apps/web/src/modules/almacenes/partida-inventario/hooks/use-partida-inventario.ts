import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createPartidaInventario,
  deletePartidaInventario,
  getPartidaInventarioById,
  getPartidasInventario,
  updatePartidaInventario,
} from "../api/partida-inventario.api";
import { partidaInventarioKeys } from "../api/partida-inventario.key";
import type {
  CreatePartidaInventarioRequest,
  PagedResult,
  PartidaInventarioQueryParams,
  PartidaInventarioResponse,
  UpdatePartidaInventarioRequest,
} from "../types/partida-inventario.types";

export function usePartidasInventario(
  params?: PartidaInventarioQueryParams,
  options?: Omit<
    UseQueryOptions<PagedResult<PartidaInventarioResponse>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: partidaInventarioKeys.list(params),
    queryFn: () => getPartidasInventario(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function usePartidaInventario(
  id: number,
  options?: Omit<
    UseQueryOptions<PartidaInventarioResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: partidaInventarioKeys.detail(id),
    queryFn: () => getPartidaInventarioById(id),
    enabled: id > 0,
    ...options,
  });
}

export function useCreatePartidaInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePartidaInventarioRequest) =>
      createPartidaInventario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: partidaInventarioKeys.lists(),
      });
    },
  });
}

export function useUpdatePartidaInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePartidaInventarioRequest;
    }) => updatePartidaInventario(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: partidaInventarioKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: partidaInventarioKeys.detail(variables.id),
      });
    },
  });
}

export function useDeletePartidaInventario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePartidaInventario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: partidaInventarioKeys.lists(),
      });
    },
  });
}
