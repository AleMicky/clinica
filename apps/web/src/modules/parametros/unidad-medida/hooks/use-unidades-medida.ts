"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUnidadMedida,
  deleteUnidadMedida,
  getUnidadMedidaById,
  getUnidadesMedida,
  updateUnidadMedida,
} from "../api/unidad-medida.api";
import { unidadMedidaKeys } from "../api/unidad-medida.key";
import type {
  CreateUnidadMedidaRequest,
  UnidadMedidaQueryParams,
  UpdateUnidadMedidaRequest,
} from "../types/unidad-medida.types";

export function useUnidadesMedida(params?: UnidadMedidaQueryParams) {
  return useQuery({
    queryKey: unidadMedidaKeys.list(params as Record<string, unknown>),
    queryFn: () => getUnidadesMedida(params),
  });
}

export function useUnidadMedida(id: number, enabled = true) {
  return useQuery({
    queryKey: unidadMedidaKeys.detail(id),
    queryFn: () => getUnidadMedidaById(id),
    enabled: enabled && id > 0,
  });
}

export function useCreateUnidadMedida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUnidadMedidaRequest) => createUnidadMedida(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unidadMedidaKeys.all });
    },
  });
}

export function useUpdateUnidadMedida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUnidadMedidaRequest }) =>
      updateUnidadMedida(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: unidadMedidaKeys.all });
      queryClient.invalidateQueries({ queryKey: unidadMedidaKeys.detail(variables.id) });
    },
  });
}

export function useDeleteUnidadMedida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUnidadMedida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unidadMedidaKeys.all });
    },
  });
}
