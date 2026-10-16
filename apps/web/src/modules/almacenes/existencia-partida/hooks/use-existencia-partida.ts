import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createExistenciaPartida,
  deleteExistenciaPartida,
  getExistenciaPartidaById,
  getExistenciasPartidas,
  updateExistenciaPartida,
} from "../api/existencia-partida.api";
import { existenciaPartidaKeys } from "../api/existencia-partida.key";
import { existenciaKeys } from "../../existencia/api/existencia.key";
import type {
  CreateExistenciaPartidaRequest,
  ExistenciaPartidaQueryParams,
  ExistenciaPartidaResponse,
  PagedResult,
  UpdateExistenciaPartidaRequest,
} from "../types/existencia-partida.types";

export function useExistenciasPartidas(
  params?: ExistenciaPartidaQueryParams,
  options?: Omit<
    UseQueryOptions<PagedResult<ExistenciaPartidaResponse>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: existenciaPartidaKeys.list(params),
    queryFn: () => getExistenciasPartidas(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useExistenciaPartida(
  id: number,
  options?: Omit<
    UseQueryOptions<ExistenciaPartidaResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: existenciaPartidaKeys.detail(id),
    queryFn: () => getExistenciaPartidaById(id),
    enabled: id > 0,
    ...options,
  });
}

export function useCreateExistenciaPartida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExistenciaPartidaRequest) =>
      createExistenciaPartida(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: existenciaPartidaKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: existenciaKeys.lists(),
      });
    },
  });
}

export function useUpdateExistenciaPartida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateExistenciaPartidaRequest;
    }) => updateExistenciaPartida(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: existenciaPartidaKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: existenciaPartidaKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: existenciaKeys.lists(),
      });
    },
  });
}

export function useDeleteExistenciaPartida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteExistenciaPartida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: existenciaPartidaKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: existenciaKeys.lists(),
      });
    },
  });
}
