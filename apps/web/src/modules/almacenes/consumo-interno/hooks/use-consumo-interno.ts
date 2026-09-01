"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  anularConsumoInterno,
  confirmarConsumoInterno,
  createConsumoInterno,
  deleteConsumoInterno,
  getConsumoInternoById,
  getConsumosInterno,
  updateConsumoInterno,
} from "../api/consumo-interno.api";
import { consumoInternoKeys } from "../api/consumo-interno.key";
import type {
  ConsumoInternoQueryParams,
  AnularConsumoInternoRequest,
  CreateConsumoInternoRequest,
  UpdateConsumoInternoRequest,
} from "../types/consumo-interno.types";

export function useConsumosInterno(params?: ConsumoInternoQueryParams) {
  return useQuery({
    queryKey: consumoInternoKeys.list(params),
    queryFn: () => getConsumosInterno(params),
  });
}

export function useConsumoInterno(id: number, enabled = true) {
  return useQuery({
    queryKey: consumoInternoKeys.detail(id),
    queryFn: () => getConsumoInternoById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateConsumoInterno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConsumoInternoRequest) =>
      createConsumoInterno(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: consumoInternoKeys.all,
      });
    },
  });
}

export function useUpdateConsumoInterno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateConsumoInternoRequest;
    }) => updateConsumoInterno(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: consumoInternoKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: consumoInternoKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteConsumoInterno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteConsumoInterno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: consumoInternoKeys.all,
      });
    },
  });
}

export function useConfirmarConsumoInterno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => confirmarConsumoInterno(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: consumoInternoKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: consumoInternoKeys.detail(id),
      });
    },
  });
}

export function useAnularConsumoInterno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AnularConsumoInternoRequest;
    }) => anularConsumoInterno(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: consumoInternoKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: consumoInternoKeys.detail(variables.id),
      });
    },
  });
}
