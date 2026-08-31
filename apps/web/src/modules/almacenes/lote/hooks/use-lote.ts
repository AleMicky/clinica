import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createLote,
  deleteLote,
  getLoteById,
  getLotes,
  updateLote,
} from "../api/lote.api";
import { loteKeys } from "../api/lote.key";
import type {
  CreateLoteRequest,
  PagedResult,
  LoteQueryParams,
  LoteResponse,
  UpdateLoteRequest,
} from "../types/lote.types";

export function useLotes(
  params?: LoteQueryParams,
  options?: Omit<
    UseQueryOptions<PagedResult<LoteResponse>, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: loteKeys.list(params),
    queryFn: () => getLotes(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useLote(
  id: number,
  options?: Omit<
    UseQueryOptions<LoteResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: loteKeys.detail(id),
    queryFn: () => getLoteById(id),
    enabled: id > 0,
    ...options,
  });
}

export function useCreateLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoteRequest) => createLote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loteKeys.lists() });
    },
  });
}

export function useUpdateLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateLoteRequest;
    }) => updateLote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: loteKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: loteKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteLote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteLote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loteKeys.lists() });
    },
  });
}
